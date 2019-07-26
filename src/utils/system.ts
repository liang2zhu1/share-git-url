import * as vscode from "vscode";

/**
 * Show a banner requiring user dismissal at right bottom
 * @param message Message to show
 */
export function showInfoBanner(message: string): void {
    vscode.window.showInformationMessage(message);
}

/**
 * Copy url to clipboard and show an auto-dismissiable message on status bar
 * @param url url to copy to clipboard
 */
export function copyToClipBoard(url: string): void {
    vscode.env.clipboard.writeText(url);
    vscode.window.setStatusBarMessage("Link copied to clipboard!", 3000);
}

/**
 * Show auto-dismiss message on status bar
 * @param message Message to show on status bar
 */
export function showStatusBarMessage(message: string): void {
    vscode.window.setStatusBarMessage(message, 5000);
}

/**
 * Get configuration property
 * @param name name of the configuration
 */
export function getConfigurationProperty(name: string): unknown {
    return vscode.workspace.getConfiguration().get(name);
}
