/* eslint-disable prettier/prettier */
import * as vscode from "vscode";
const fs = require("fs");
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/terminalUtils";

export async function generateIdentity(specialContext: vscode.ExtensionContext) {
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

  // Call the id generator function
  idGenerator(idName, certificatePath, specialContext.extensionPath);
}

// Generator function that runs the keygenerator.sh script to generate certificates
async function idGenerator(
  id: string,
  certificatesFolderPath: string,
  extensionPath: string,
) {
  // Access the files in the certificate folder directory
  const files = fs.readdirSync(certificatesFolderPath);
  try {
    // If the folder contains a file with id already, report it to the user and do not overwrite certificates
    if (
      files.includes(
        id + "_cert.pem" || files.includes(id + "_privk.pem"),
      )
    ) {
      vscode.window.showWarningMessage(
        "ID already exists. Please enter a unique ID",
      );
      return;
    }
    vscode.window.showInformationMessage(
      `Generating certificates in folder ${certificatesFolderPath}`,
    ); // show in the extension environment

    // Change certificatesFolderPath to a wsl path
    const wslCertificatePath = utilities.getPathOSAgnostic(
      certificatesFolderPath,
    );

    runCommandInTerminal("Generate Identity", `cd ${extensionPath}/dist; ${utilities.getBashCommand()} generate_keys.sh --id ${id} --dest-folder "${wslCertificatePath}" --enc-key`);

    // Run Script through terminal
    // terminal.sendText(`cd ${extensionPath}/dist; ${utilities.getBashCommand()} generate_keys.sh --id ${id} --dest-folder "${wslCertificatePath}" --enc-key`);

    // Show success message to user
    vscode.window.showInformationMessage(
      id + " created successfully",
    );

    // have command to change directory inside of the dist folder
  } catch (error: any) {
    console.error(error.message);
    vscode.window.showErrorMessage("Error generating certificates");
  }

}