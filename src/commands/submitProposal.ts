import * as vscode from "vscode";
import { execSync } from "child_process";
import * as utilities from "../Utilities/osUtilities";
import { isValidUrl } from "../Utilities/urlUtilities";

// context: vscode.ExtensionContext is for the extension to be able to access the extension path
export async function submitProposal(context: vscode.ExtensionContext) {
  try {

    // Prompt user for network URL
    const networkUrl = await vscode.window.showInputBox({
      prompt: "Enter the network URL",
      placeHolder: "https://explorers1.confidential-ledger.azure.com", // temporary placeholder
    });

    // If no URL is entered, report it to the user
    if (!networkUrl || !isValidUrl(networkUrl)) {
      vscode.window.showErrorMessage("Invalid URL entered");
      return;
    }

    // Prompt user for signing certificate
    const signingCert = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select signing certificate",
      title: "Select signing certificate",
    });

    // If no file is selected, report it to the user
    if (!signingCert || signingCert.length === 0) {
      vscode.window.showInformationMessage("No file selected");
      return;
    }

    // Prompt user for signing key
    const signingKey = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select signing key",
      title: "Select signing key",
    });

    // If no file is selected, report it to the user
    if (!signingKey || signingKey.length === 0) {
      vscode.window.showInformationMessage("No file selected");
      return;
    }

    // Prompt user for proposal file
    const proposalFile = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select proposal file",
      title: "Select proposal file",
    });

    // If no file is selected, report it to the user
    if (!proposalFile || proposalFile.length === 0) {
      vscode.window.showInformationMessage("No file selected");
      return;
    }

    // Convert the paths to strings
    const signingCertPath = utilities.getPathOSAgnostic(signingCert[0].fsPath);
    const signingKeyPath = utilities.getPathOSAgnostic(signingKey[0].fsPath);
    const proposalFileString = utilities.getPathOSAgnostic(proposalFile[0].fsPath);

    // Run the proposal script using the exec sync function
    const result = execSync(`cd ${context.extensionPath + '/dist/'} && ${utilities.getBashCommand()} ` +
      "submit_proposal.sh" +
      " --network-url " +
      networkUrl +
      " --signing-cert " +
      signingCertPath +
      " --signing-key " +
      signingKeyPath +
      " --proposal-file " +
      proposalFileString,
    );

    if (result) {
      console.info(result.toString());
    } else {
      console.info("No output from execSync");
    }
  } catch (error) {
    console.error("Proposal could not be submitted", error);
    vscode.window.showErrorMessage("Proposal failed to submit");
  }
}
