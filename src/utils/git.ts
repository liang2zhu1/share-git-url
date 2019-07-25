import * as vscode from "vscode";
import * as git from "../api/git";
import { logVerbose } from "./logger";

let gitApi: git.API;

/**
 * One-off initialization get built-in git extension
 */
export function initialize() {
    const gitExtension = vscode.extensions.getExtension<git.GitExtension>('vscode.git')!.exports;
    gitApi = gitExtension.getAPI(1);
    logVerbose(`gitApi initilaized: ${!!gitApi}`);
}

/**
 * Get if a file in git is latest with origin/master
 * @param repository vs code repo 
 * @param gitPath relative git file path (with no leading '/')
 */
export async function isLatest(repository: git.Repository, gitPath: string): Promise<boolean> {
    const diff = await repository.diffWith("origin/master", gitPath);
    return !!diff;
}

/**
 * Get all git repositories available from built-in git extension
 */
export function getGitRepositories(): git.Repository[] {
    const repositories = gitApi.repositories;
    return repositories;
}