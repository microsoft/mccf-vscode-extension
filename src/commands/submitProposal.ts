import * as vscode from "vscode";
import * as utilities from "../Utilities/osUtilities";
import { isValidUrl } from "../Utilities/urlUtilities";
import { runCommandInTerminal } from "../Utilities/extensionUtils";
import { logAndDisplayError } from "../Utilities/errorUtils";

// context: vscode.ExtensionContext is for the extension to be able to access the extension path
export async function submitProposal(context: vscode.ExtensionContext) {
  try {
    // Prompt user for network URL
    const networkUrl = await vscode.window.showInputBox({
      prompt: "Enter the CCF network URL",
      placeHolder: "https://127.0.0.1:8000",
      value: "https://127.0.0.1:8000",
      ignoreFocusOut: true,
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
      filters: {
        "Pem files": ["pem"],
      },
    });

    // If no file is selected, report it to the user
    if (!signingCert || signingCert.length === 0) {
      vscode.window.showErrorMessage("No certificate file selected");
      return;
    }

    // Prompt user for signing key
    const signingKey = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select signing key",
      title: "Select signing key",
      filters: {
        "Pem files": ["pem"],
      },
    });

    // If no file is selected, report it to the user
    if (!signingKey || signingKey.length === 0) {
      vscode.window.showErrorMessage("No key file selected");
      return;
    }

    // Prompt user for proposal file
    const proposalFile = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select proposal file",
      title: "Select proposal file",
      filters: {
        "JSON files": ["json"],
      },
    });

    // If no file is selected, report it to the user
    if (!proposalFile || proposalFile.length === 0) {
      vscode.window.showErrorMessage("No proposal file selected");
      return;
    }

    // Convert the paths to strings
    const signingCertPath = utilities.getPathOSAgnostic(signingCert[0].fsPath);
    const signingKeyPath = utilities.getPathOSAgnostic(signingKey[0].fsPath);
    const proposalFileString = utilities.getPathOSAgnostic(
      proposalFile[0].fsPath,
    );

    // Create the command to run in the terminal
    const command =
      `cd "${
        context.extensionPath + "/dist/scripts"
      }"; ${utilities.getBashCommand()} ` +
      "submit_proposal.sh" +
      " --network-url " +
      networkUrl +
      " --signing-cert " +
      signingCertPath +
      " --signing-key " +
      signingKeyPath +
      " --proposal-file " +
      proposalFileString;

    // Run the command in the terminal
    runCommandInTerminal("Submit Proposal Terminal", command);

    // Display message to the user
    vscode.window.showInformationMessage("Proposal submission in progress");
  } catch (error: any) {
    logAndDisplayError("Proposal could not be submitted", error);
  }
}
