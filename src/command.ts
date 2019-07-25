import * as vscode from 'vscode';
import { failedToGetUrlError, fileChangedWarning } from './resources';
import { getAzureReposUrl } from './utils/azure.repos';
import { isLatest } from './utils/git';
import { copyToClipBoard, showInfoBanner, showStatusBarMessage } from "./utils/system";
import { log } from './utils/logger';

export async function commandCopySelectionUrl(arg?: any) {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor && editor.selection ) {
        const { url, repo, gitPath, error } = await getAzureReposUrl(arg, editor.selection);
        if (url) {
            copyToClipBoard(url);
            if (isLatest(repo!, gitPath!)) {
                showInfoBanner(fileChangedWarning);
            }
        } else {
            showStatusBarMessage(error || failedToGetUrlError);
        }
    } else {
        log(`editor or selection does not exist`);
    }
}

export async function commandOpenSelectionInAzureRepos(arg?: any) {
    const editor = vscode.window && vscode.window.activeTextEditor;
    if (editor && editor.selection) {
        const { url, error } = await getAzureReposUrl(arg, editor.selection);
        if (url) {
            vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
        } else {
            showStatusBarMessage(error || failedToGetUrlError);
        }
    } else {
        log(`editor or selection does not exist`);
    }
}

export async function commandOpenInAzureRepos(arg?: any) {
    const { url, error } = await getAzureReposUrl(arg);
    if (url) {
        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
    } else {
        showStatusBarMessage(error || failedToGetUrlError);
    }
}

export async function commandCopyUrl(arg?: any) {
    const { url, error } = await getAzureReposUrl(arg);
    if (url) {
        copyToClipBoard(url);
    } else {
        showStatusBarMessage(error || failedToGetUrlError);
    }
}

export async function commandCopyMarkdown(arg?: any) {
    const { url, gitPath, error } = await getAzureReposUrl(arg);
    if (url && gitPath) {
        const markdown = `[${gitPath}](${url})`;
        copyToClipBoard(markdown);
    } else {
        showStatusBarMessage(error || failedToGetUrlError);
    }
}

export async function commandCopySelectionMarkdown(arg?: any) {
    const editor = vscode.window && vscode.window.activeTextEditor; 
    if (editor && editor.selection) {
        const { url, gitPath, error } = await getAzureReposUrl(arg, editor.selection);
        if (url && gitPath) {
            const selectedText = editor.document.getText(editor.selection);
            const markdown = `[${gitPath}](${url})\r\n\r\n\`\`\`\r\n${selectedText}\r\n\`\`\``;
            copyToClipBoard(markdown);
        } else {
            showStatusBarMessage(error || failedToGetUrlError);
        }
    } else {
        log(`editor or selection does not exist`);
    }
}