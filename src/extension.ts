import * as _ from "lodash";
import * as vscode from "vscode";
import * as command from "./command";
import { initialize } from "./utils/git";
import { log, logVerbose } from "./utils/logger";

export function activate(context: vscode.ExtensionContext) {
	log("extension activated");
	_.templateSettings.interpolate = /{{([\s\S]+?)}}/g; // Set global interpolation template  to mustache {{ }}

	logVerbose("Initialize git");
	initialize();

	logVerbose("Register commands");
	registerCommands(context);
}

function registerCommands(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand("shareGitFile.copyAzureReposUrl", command.commandCopyUrl));
	context.subscriptions.push(vscode.commands.registerCommand("shareGitFile.copyAzureReposSelectionUrl", command.commandCopySelectionUrl));
	context.subscriptions.push(vscode.commands.registerCommand("shareGitFile.openInAzureRepos", command.commandOpenInAzureRepos));
	context.subscriptions.push(vscode.commands.registerCommand("shareGitFile.openSelectionInAzureRepos", command.commandOpenSelectionInAzureRepos));
	context.subscriptions.push(vscode.commands.registerCommand("shareGitFile.copyAzureReposSelectionMarkdown", command.commandCopySelectionMarkdown));
	context.subscriptions.push(vscode.commands.registerCommand("shareGitFile.copyAzureReposMarkdown", command.commandCopyMarkdown));
}

export function deactivate() {
	log("extension deactivated");
}