/* eslint-disable prettier/prettier */
import * as vscode from "vscode";
import { execSync } from "child_process";
import path = require("path");
const fs = require("fs");
import * as utilities from "../Utilities/osUtilities";

export async function generateIdentity(specialContext: vscode.ExtensionContext) {
  // Prompt user to enter member name
  const idName = await vscode.window.showInputBox({
    prompt: "Enter ID",
    placeHolder: "ID Name",
  });

  // If no member name is entered, report it to the user
  if (!idName || idName.length === 0) {
    vscode.window.showInformationMessage("No member name entered");
    return;
  }

  // Create a certificate directory folder name accessible by all functions in this command
  const certificateFolder = "Certificates";

  // Get a certificate directory path accessible by all functions
  const certificatePath = path.join(process.cwd(), certificateFolder);

  // Call the createFolder function
  createFolder(certificatePath);

  // Call the memberGenerator function
  idGenerator(idName, certificatePath, specialContext.extensionPath);
}

// Create a certificate directory path accessible by all functions in this command
async function createFolder(certificatesFolderPath: string) {
  // Check if the folder exists in the current file system. If not, create a certificates folder
  try {
    if (!fs.existsSync(certificatesFolderPath)) {
      fs.mkdirSync(certificatesFolderPath);
      vscode.window.showInformationMessage(
        certificatesFolderPath + " directory created successfully",
      ); // show in the extension environment
    }
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage("Error creating certificates folder");
  }
}

// Member Generator function that runs the keygenerator.sh script to generate member certificates
async function idGenerator(
  id: string,
  certificatesFolderPath: string,
  extensionPath: string,
) {
  // Access the files in the certificate folder directory
  const files = fs.readdirSync(certificatesFolderPath);
  try {
    // If the folder contains a file with membername already, report it to the user and do not overwrite member certificates
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
      `Generating member certificates in folder ${certificatesFolderPath}`,
    ); // show in the extension environment

    // Change certificatesFolderPath to a wsl path
    const wslCertificatePath = utilities.getExtensionPathOSAgnostic(
      certificatesFolderPath,
    );

    // Run the generate_keys.sh script to generate member certificates and encription keys
    execSync(`(cd ${extensionPath}/dist && ${utilities.getBashCommand()} generate_keys.sh --id ${id} --dest-folder "${wslCertificatePath}" --enc-key)`);

    // Show success message to user
    vscode.window.showInformationMessage(
      id + " created successfully",
    );
    
    // have command to change directory inside of the dist folder
  } catch (error: any) {
    console.error(error.message);
    vscode.window.showErrorMessage("Error generating member certificates");
  }

}
