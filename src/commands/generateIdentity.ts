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

  // Get a certificate directory path accessible by all functions
  const certificatePath = certificateFolderUri[0].fsPath;

  // Check to see if ID already exists in the certificate folder
  if (fs.existsSync(`${certificatePath}/${idName}_cert.pem`)) {
    vscode.window.showInformationMessage("ID already exists");
    return;
  }

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
    ); // show in the extension environment

    // Change certificatesFolderPath to a wsl path
    const wslCertificatePath = utilities.getPathOSAgnostic(
      certificatesFolderPath,
    );

    runCommandInTerminal(
      "Generate Identity",
      `cd ${extensionPath}/dist; ${utilities.getBashCommand()} generate_keys.sh --id ${id} --dest-folder "${wslCertificatePath}" --enc-key`,
    );

    // Show success message to user
    vscode.window.showInformationMessage(id + " created successfully");

    // have command to change directory inside of the dist folder
  } catch (error: any) {
    console.error(error.message);
    vscode.window.showErrorMessage("Error generating certificates");
  }
}
