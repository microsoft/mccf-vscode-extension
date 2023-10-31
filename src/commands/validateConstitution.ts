import * as vscode from "vscode";
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/extensionUtils";
import { logAndDisplayError } from "../Utilities/errorUtils";

// Build and start a CCF network inside the devcontainer
export async function validateCCFConstitution(
  specialContext: vscode.ExtensionContext,
) {
  try {
    // Get the folder where the app is located
    const appFolder = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select project folder",
      title: "Select project folder",
    });

    // If no folder is selected, report it to the user
    if (!appFolder || appFolder.length === 0) {
      vscode.window.showErrorMessage("No folder selected");
      throw new Error("No mccf app folder selected");
    }

    // Get the folder where the constitution is located
    const govFolder = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select constitution folder",
      title: "Select constitution folder",
    });

    // If no folder is selected, report it to the user
    if (!govFolder || govFolder.length === 0) {
      vscode.window.showErrorMessage("No folder selected");
      throw new Error("No constitution folder selected");
    }

    // Get the path of the folder
    const appFolderPath = appFolder[0].fsPath;
    const govFolderPath = govFolder[0].fsPath;

    // Build and start the CCF network commands inside devcontainer
    const installCommand = "npm --prefix " + appFolderPath + " install";
    const buildCommand = "npm --prefix " + appFolderPath + " run build";
    const startCommand =
      "/opt/ccf_virtual/bin/sandbox.sh --constitution-dir " +
      govFolderPath +
      " --js-app-bundle " +
      appFolderPath +
      "/dist/";

    // Create a sequence of commands to run in the terminal
    // such that we will execute the subsequent commands only if the previous ones succeed
    const commandsSequence = [installCommand, buildCommand, startCommand];

    const finalCommand = commandsSequence.join(" && ");

    // Run the command in the terminal
    runCommandInTerminal("Start CCF Network Terminal", finalCommand);

    // Prompt user to enter network url
    const networkUrl = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Wait until the network starts and enter the CCF network URL",
      placeHolder: "https://example.confidential-ledger.azure.com",
    });

    // If no network url is entered, report it to the user
    if (!networkUrl || networkUrl.length === 0) {
      vscode.window.showInformationMessage("No network url entered");
      return;
    }

    // Prompt user to enter signing cert via file explorer
    const signingCert = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select signing certificate",
      title: "Select signing certificate",
      filters: { "PEM files": ["pem"] },
    });

    // Check if signing cert is undefined
    if (!signingCert) {
      vscode.window.showInformationMessage("No signing cert selected");
      return;
    }

    // Prompt user to enter signing key via file explorer
    const signingKey = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select signing key",
      title: "Select signing key",
      filters: { "PEM files": ["pem"] },
    });

    // Check if signing key is undefined
    if (!signingKey) {
      vscode.window.showInformationMessage("No signing key selected");
      return;
    }

    // Retrieve paths of sign cert, sign key, and voting file
    const signingCertPath = utilities.getPathOSAgnostic(signingCert[0].fsPath);
    const signingKeyPath = utilities.getPathOSAgnostic(signingKey[0].fsPath);
    const extensionPath = specialContext.extensionPath;

    const testCommand = `cd ${extensionPath}/src/scripts; ${utilities.getBashCommand()} ./test_constitution.sh --network-url ${networkUrl} --signing-cert ${signingCertPath} --signing-key ${signingKeyPath}`;
    runCommandInTerminal("Test custom constitution", testCommand);
  } catch (error: any) {
    logAndDisplayError("Failed to validate constitution", error);
  }
}
