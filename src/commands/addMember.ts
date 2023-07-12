import * as vscode from "vscode";
import { execSync } from "child_process";
import path = require("path");
import * as utilities from "../utilities/osUtilities";
const fs = require("fs");

export async function addMember(specialContext: vscode.ExtensionContext) {
  // Prompt user to enter member name
  const memberName = await vscode.window.showInputBox({
    prompt: "Enter the member name",
    placeHolder: "Member name",
  });

  // If no member name is entered, report it to the user
  if (!memberName || memberName.length === 0) {
    vscode.window.showInformationMessage("No member name entered");
    return;
  }

  // Create a certificate directory folder name accessible by all functions in this command
  const certificateFolder = "Certificates";

  // Get a certificate directory path accessible by all functions
  const certificatePath = path.join(process.cwd(), certificateFolder);

  // The following line translates the windows directory path to our extension into a wsl path
  const extensionPath = utilities.getExtensionPathOSAgnostic(
    specialContext.extensionPath,
  );

  // Call the createFolder function
  createFolder(certificatePath);

  // Call the memberGenerator function
  memberGenerator(memberName, certificatePath, extensionPath);
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
async function memberGenerator(
  memberName: string,
  certificatesFolderPath: string,
  extensionPath: string,
) {
  // Access the files in the certificate folder directory
  const files = fs.readdirSync(certificatesFolderPath);
  try {
    // If the folder contains a file with membername already, report it to the user and do not overwrite member certificates
    if (
      files.includes(
        memberName + "_cert.pem" || files.includes(memberName + "_privk.pem"),
      )
    ) {
      vscode.window.showWarningMessage(
        "Member already exists. Please enter a unique member name",
      );
      return;
    }
    vscode.window.showInformationMessage(
      `Generating member certificates in folder ${certificatesFolderPath}`,
    ); // show in the extension environment

    // This will create a subshell to execute the script inside of the certificate directory path without changing our main process's working directory
    execSync(
      `(cd ${certificatesFolderPath
        .toString()
        .trim()} && ${utilities.getBashCommand()} ${extensionPath}/dist/keygenerator.sh --name ${memberName})`,
    );
  } catch (error: any) {
    console.error(error.message);
    vscode.window.showErrorMessage("Error generating member certificates");
  }

  // Show success message to user
  vscode.window.showInformationMessage(
    "Member " + memberName + " created successfully",
  );
}
