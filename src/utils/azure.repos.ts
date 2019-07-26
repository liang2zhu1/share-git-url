import * as assert from "assert";
import * as fs from "fs";
import * as _ from "lodash";
import * as os from "os";
import * as vscode from "vscode";
import { AzureReposUrlResult } from "../api/interface";
import { fileNotUnderGitError } from "../resources";
import { getGitRepositories } from "./git";
import { log, logVerbose } from "./logger";
import { getConfigurationProperty } from "./system";

/**
 * Get Azure Repos url for a file/folder or a selection within a file
 * @param arg Optional parameter from event
 * @param selection Optional parameter for selection
 */
export async function getAzureReposUrl(arg?: any, selection?: vscode.Selection): Promise<AzureReposUrlResult> {
    let fileFsPath: string | null = null; // File-system path for target file
    let defaultResult: AzureReposUrlResult = { url: null, repo: null, gitPath: null, error: null };
    try {
        // Determine the file path because we may get invoked from multiple sources 
        if (arg && arg.fsPath) {
            fileFsPath = arg.fsPath; // From explorer or editor title context menu 
        }
        else {
            const document = vscode.window && vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
            if (document) {
                fileFsPath = document.fileName; // From shortcut key event
            }
        }

        if (fileFsPath) {
            const repositories = getGitRepositories();
            logVerbose(`Found ${repositories && repositories.length} repos, paths are: ${repositories.map(r => r.rootUri.fsPath).join(",")}`);

            // Verify file existence on file system 
            if (fs.existsSync(fileFsPath)) {
                // TODO: Nice to have - check if the file is within git otherwise there's no point

                // Determine which repositories current file belongs to (when more than one repo presents)
                const isCaseSensitive = os.platform() !== "win32"; // Assume case insensitive on windows 
                const repo = repositories.find(r => isCaseSensitive
                    ? fileFsPath!.startsWith(r.rootUri.fsPath)
                    : fileFsPath!.toLocaleLowerCase().startsWith(r.rootUri.fsPath.toLowerCase()));
                if (repo) {
                    await repo.getConfigs(); // Workaround that repo.state may not be populated until get config.

                    if (repo.state.remotes && repo.state.remotes.length > 0) {
                        const remoteRoot = repo.state.remotes[0].fetchUrl; // Ignore multi remotes scenario for now
                        const useCurrentBranch = getConfigurationProperty("shareGitFile.useCurrentBranch") as boolean;
                        const branch = useCurrentBranch
                            ? (await repo.getBranch("HEAD")).name // TODO: this is expensive and cause 1-2 seconds delay on UI, ideally we should cache
                            : getConfigurationProperty("shareGitFile.defaultBranchName") as string;
                        if (remoteRoot && branch) {
                            const localRepoRootPath = repo.rootUri.fsPath;
                            const relativeFilePath = convertFsPathToUrlFormat(localRepoRootPath, fileFsPath, isCaseSensitive);
                            const url = getWebAccessFileUrl(
                                getWebAccessRepoRootUrl(remoteRoot),
                                branch,
                                relativeFilePath,
                                selection
                            );
                            return {
                                url: url,
                                repo: repo,
                                gitPath: relativeFilePath.substr(1), // Remove leading '/'
                                error: null
                            };
                        }
                    }
                }
                else {
                    defaultResult.error = _.template(fileNotUnderGitError)({ fileFsPath: fileFsPath });
                    log(defaultResult.error);
                }
            }
        } else {
            log(`No file path is found, no argument from event nor active document`);
        }
    }
    catch (error) {
        log(`Encountered exception during 'getAzureReposUrl', error: ${error}`);
    }

    return defaultResult;
}

/**
 * Convert a file file-system path into a relative uri format 
 * Example - repository root is 'c:\source' and file path is 'c:\source\foo\bar\baz.txt' the result is '/foo/bar/baz.txt 
 * @param rootFsPath Repository root file-system path
 * @param fileFsPath File file-system path
 * @param isCaseSensitive Is file-system case sensitive
 */
function convertFsPathToUrlFormat(rootFsPath: string, fileFsPath: string, isCaseSensitive: boolean): string {
    const index = isCaseSensitive
        ? fileFsPath.indexOf(rootFsPath)
        : fileFsPath.toLocaleLowerCase().indexOf(rootFsPath.toLocaleLowerCase());

    if (index === 0) {
        const relativeFsPath = fileFsPath.substring(rootFsPath.length);
        const uriPath = relativeFsPath.replace(/\\/g, "/");
        return uriPath;
    }

    return "/"; // This should not happen but if it does fallback to root is better than error 
}

/**
 * Get repo web access root url from Azure Repo git remote url
 * @param repoRemoteUrl repo root url from git configuration
 */
function getWebAccessRepoRootUrl(repoRemoteUrl: string): string {
    let repoRootUrl = repoRemoteUrl;
    if (isAzureDevOpsHostedUrl(repoRootUrl)) {
        repoRootUrl = removeOrgNameAt(repoRootUrl);
        repoRootUrl = removeFullRef(repoRootUrl);
    }
    return repoRootUrl;
}

/**
 * Azure DevOps Service remote url may contains 'org-name@' before the domain for legacy reason
 */
function removeOrgNameAt(repoRemoteUrl: string): string {
    let repoRootUrl = repoRemoteUrl;
    if (repoRootUrl.indexOf("@") >= 0) {
        // url may look like https://mseng@dev.azure.com/mseng/AzureDevOps/_git/AzureDevOps
        repoRootUrl = repoRootUrl.replace(/\/\/[^@]*@/, "//");
    }
    return repoRootUrl;
}

/**
 * Azure DevOps supports limited ref and if enlisted using full refs it needs get removed 
  */
function removeFullRef(repoRootUrl: string): string {
    repoRootUrl = repoRootUrl.replace(/_git\/_full\//i, "_git/"); // '_git/_full/' => '_git/'
    return repoRootUrl;
}

/**
 * Get url for specific file/folder (or selection inside it) under specific branch in Azure Repo
 * @param repoWebAccessRootUrl Root url for repo in Azure DevOps web access 
 * @param branch name of branch 
 * @param path relative path of file 
 */
function getWebAccessFileUrl(repoWebAccessRootUrl: string, branch: string, path: string, selection?: vscode.Selection): string {
    assert(path.startsWith("/"), "Path should begin with a forward slash");
    let url = `${repoWebAccessRootUrl}?path=${encodeURIComponent(path)}&version=GB${encodeURIComponent(branch)}`;
    if (selection) {
        const selectionParameters =
            `&line=${encodeURIComponent(selection.start.line + 1)}` + // VS Code posision is 0-based...
            `&lineEnd=${encodeURIComponent(selection.end.line + 1)}` +
            `&lineStartColumn=${encodeURIComponent(selection.start.character + 1)}` +
            `&lineEndColumn=${encodeURIComponent(selection.end.character + 1)}` +
            `&lineStyle=plain`;
        url = `${url}${selectionParameters}`;
    }
    return url;
}

function isAzureDevOpsHostedUrl(repoRoot: string): boolean {
    const lcRepoRoot = repoRoot.toLocaleLowerCase();
    return lcRepoRoot.indexOf("dev.azure.com") >= 0 || lcRepoRoot.indexOf(".visualstudio.com") >= 0;
}