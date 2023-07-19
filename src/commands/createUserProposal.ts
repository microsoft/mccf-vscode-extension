import * as vscode from "vscode";
import path = require("path");
const fs = require("fs");
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/terminalUtils";

export async function createUserProposal(specialContext: vscode.ExtensionContext){

    // Show user an open dialogue box to choose the cert-file
    const certFile = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select the user cert.pem file",
    });

    // Check if certFile is undefined
    if (!certFile) {
        vscode.window.showInformationMessage("No file selected");
        return;
    }

    // Have user select the destination folder to store the proposal file
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
        placeHolder: "user0",
    });

    // If no id is entered, report it to the user
    if (!idName || idName.length === 0) {
        vscode.window.showInformationMessage("No ID entered");
        return;
    }

}