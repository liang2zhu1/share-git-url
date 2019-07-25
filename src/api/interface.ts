import * as git from "./git";

export interface AzureReposUrlResult {
    url: string | null;
    repo: git.Repository | null;
    gitPath: string | null;
    error: string | null;
}