/* eslint-disable prettier/prettier */
import * as vscode from "vscode";
import path = require("path");
const fs = require("fs");
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/terminalUtils";

export async function createMemberProposal(specialContext: vscode.ExtensionContext) {

    // Show user an open dialogue box to choose the cert-file
    const certFile = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select the member cert.pem file",
    });

    // Check if certFile is undefined
    if (!certFile) {
        vscode.window.showInformationMessage("No file selected");
        return;
    }

    // Show user an open dialogue box to choose the pubk-file
    const pubkFile = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select the member pubk.pem file",
    });

    // Check if pubkFile is undefined
    if (!pubkFile) {
        vscode.window.showInformationMessage("No file selected");
        return;
    }

    // Show user an open dialogue box to choose the destination folder for the proposal files
    const destFolder = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select Folder to Store Proposal",
    });

    // Check if destFolder is undefined
    if (!destFolder) {
        vscode.window.showInformationMessage("No folder selected");
        return;
    }

    // Prompt user to enter the name of the json folder
    const idName = await vscode.window.showInputBox({
        prompt: "Enter proposal file ID",
        placeHolder: "member0",
    });

    // If no id is entered, report it to the user
    if (!idName || idName.length === 0) {
        vscode.window.showInformationMessage("No ID entered");
        return;
    }

    // Get the path of the cert-file, pubk-file, and destination folder
    const certPath = utilities.getPathOSAgnostic(certFile[0].fsPath);
    const pubkPath = utilities.getPathOSAgnostic(pubkFile[0].fsPath);
    const destPath = utilities.getPathOSAgnostic(destFolder[0].fsPath);

    // Call the generateProposal function
    generateProposal(certPath, pubkPath, destPath, idName, specialContext.extensionPath);
}

// Create member proposal function that runs the add_member_2.sh script to generate member proposals
async function generateProposal(
    certPath: string,
    pubkPath: string,
    destFolderPath: string,
    id: string,
    extensionPath: string,
) {
    try {
        // Display progress message to user
        vscode.window.showInformationMessage("Generating Member Proposal...");

        // Use the runInTerminal function to run the add_member_2.sh script
        runCommandInTerminal("Generate Member Proposal", `cd ${extensionPath}/dist; ${utilities.getBashCommand()} add_member_2.sh --cert-file "${certPath}" --pubk-file "${pubkPath}" --dest-folder "${destFolderPath}" --id ${id}`);
        vscode.window.showInformationMessage("Proposal generated at: " + destFolderPath);
    } catch (error) {
        vscode.window.showErrorMessage(`Error generating proposal: ${error}`);
    }
}
