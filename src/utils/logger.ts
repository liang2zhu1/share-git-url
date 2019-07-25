import * as vscode from "vscode";

/**
 * One-time initialization for logger
 */
const CHANNEL_NAME = "Extension: Share git url";
const _channel = vscode.window.createOutputChannel(CHANNEL_NAME);

/**
 * Log a message 
 */
export function log(message: string) {
    _channel.appendLine(message);
}

/**
 * Log a verbose message 
 */
export function logVerbose(message: string) {
    _channel.appendLine(`[VERBOSE] ${message}`);
}