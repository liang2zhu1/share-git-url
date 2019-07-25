import * as vscode from 'vscode';
import { failedToGetUrlError, fileChangedWarning } from './resources';
import { getAzureReposUrl } from './utils/azure.repos';
import { isLatest } from './utils/git';
import { copyToClipBoard, showInfoBanner, showStatusBarMessage } from "./utils/system";

export async function commandCopySelectionUrl(arg?: any) {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor) {
        const { url, repo, gitPath, error } = await getAzureReposUrl(arg, editor.selection);
        if (url) {
            copyToClipBoard(url);
            if (isLatest(repo!, gitPath!)) {
                showInfoBanner(fileChangedWarning);
            }
        } else {
            showStatusBarMessage(error || failedToGetUrlError);
        }
    }
}

export async function commandOpenSelectionInAzureRepos(arg?: any) {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor) {
        const { url } = await getAzureReposUrl(arg, editor.selection);
        if (url) {
            vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
        } else {
            showStatusBarMessage(failedToGetUrlError);
        }
    }
}

export async function commandOpenInAzureRepos(arg?: any) {
    const { url } = await getAzureReposUrl(arg);
    if (url) {
        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
    } else {
        showStatusBarMessage(failedToGetUrlError);
    }
}

export async function commandCopyUrl(arg?: any) {
    const { url } = await getAzureReposUrl(arg);
    if (url) {
        copyToClipBoard(url);
    } else {
        showStatusBarMessage(failedToGetUrlError);
    }
}

export async function commandCopyMarkdown(arg?: any) {
    const { url, gitPath } = await getAzureReposUrl(arg);
    if (url && gitPath) {
        const markdown = `[${gitPath}](${url})`;
        copyToClipBoard(markdown);
    } else {
        showStatusBarMessage(failedToGetUrlError);
    }
}

export async function commandCopySelectionMarkdown(arg?: any) {
    const { url, gitPath } = await getAzureReposUrl(arg);
    if (url && gitPath) {
        const markdown = `[${gitPath}](${url})`;
        copyToClipBoard(markdown);
    } else {
        showStatusBarMessage(failedToGetUrlError);
    }
}