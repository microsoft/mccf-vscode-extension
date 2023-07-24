import * as vscode from "vscode";
const fs = require("fs");
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/terminalUtils";

export async function generateIdentity(
  specialContext: vscode.ExtensionContext,
) {
  // Prompt user to enter name
  const idName = await vscode.window.showInputBox({
    prompt: "Enter ID",
    placeHolder: "ID Name",
    ignoreFocusOut: true,
  });

  // If no id is entered, report it to the user
  if (!idName || idName.length === 0) {
    vscode.window.showInformationMessage("No ID entered");
    return;
  }

  // Allow User to choose a directory folder to store certificates inside the vs code workspace
  const certificateFolderUri = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select Folder to Store Certificates",
  });

  // Check if certificateFolderUri is undefined
  if (!certificateFolderUri) {
    vscode.window.showInformationMessage("No folder selected");
    return;
  }

  // Check to see if ID already exists in the certificate folder to prevent duplicate
  if (fs.existsSync(`${certificateFolderUri[0].fsPath}/${idName}_cert.pem`)) {
    vscode.window.showInformationMessage("ID already exists");
    return;
  }

  // Get the path of the certificate folder and make it OS agnostic
  const certificatePath = utilities.getPathOSAgnostic(
    certificateFolderUri[0].fsPath,
  );

  // Call the id generator function
  idGenerator(idName, certificatePath, specialContext.extensionPath);
}

// Generator function that runs the keygenerator.sh script to generate certificates
async function idGenerator(
  id: string,
  certificatesFolderPath: string,
  extensionPath: string,
) {
  try {
    vscode.window.showInformationMessage(
      `Generating certificates in folder ${certificatesFolderPath}`,
    );

    runCommandInTerminal(
      "Generate Identity",
      `cd ${extensionPath}/dist; ${utilities.getBashCommand()} generate_keys.sh --id ${id} --dest-folder "${certificatesFolderPath}" --enc-key`,
    );

    // Show success message to user
    vscode.window.showInformationMessage(id + " created successfully");
  } catch (error: any) {
    console.error(error.message);
    vscode.window.showErrorMessage("Error generating certificates");
  }
}
