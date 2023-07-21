import * as vscode from "vscode";
import path = require("path");
const fs = require("fs");
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/terminalUtils";

export async function createUserProposal(
  specialContext: vscode.ExtensionContext,
) {
  // Show user an open dialogue box to choose the cert-file
  const certFile = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: "Select signing certificate",
    title: "Select signing certificate",
    filters: {
      "Pem files": ["pem"],
    },
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

  // Prompt user to enter the name of the json file
  const idName = await vscode.window.showInputBox({
    prompt: "Enter proposal file ID",
    placeHolder: "Ex: set_user0",
  });

  // If no id is entered, report it to the user
  if (!idName || idName.length === 0) {
    vscode.window.showInformationMessage("No ID entered");
    return;
  }

  // Check if proposal file with that name already exists in destination folder
  if (fs.existsSync(path.join(destFolder[0].fsPath, idName + ".json"))) {
    vscode.window.showInformationMessage(
      "Proposal file with that name already exists in destination folder",
    );
    return;
  }

  // Get the path of the certFile & destination folder
  const certPath = utilities.getPathOSAgnostic(certFile[0].fsPath);
  const destPath = utilities.getPathOSAgnostic(destFolder[0].fsPath);

  // Call the generateProposal function
  generateProposal(certPath, destPath, idName, specialContext.extensionPath);
}

// Create user proposal function that runs add_user_2.sh script to generate proposal
async function generateProposal(
  certPath: string,
  destPath: string,
  idName: string,
  extensionPath: string,
) {
  try {
    // Display progress message to user
    vscode.window.showInformationMessage("Generating User Proposal...");

    runCommandInTerminal(
      "Create User Proposal",
      `cd ${extensionPath}/dist; ${utilities.getBashCommand()} add_user.sh --cert-file "${certPath}" --dest-folder "${destPath}" --id ${idName}`,
    );
    vscode.window.showInformationMessage(
      "User Proposal Generated at:" + destPath,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating proposal: ${error}`);
  }
}
