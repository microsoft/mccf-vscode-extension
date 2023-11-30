import * as vscode from "vscode";
import * as utilities from "../Utilities/osUtilities";
import { isValidUrl } from "../Utilities/urlUtilities";
import { runCommandInTerminal } from "../Utilities/extensionUtils";
import { logAndDisplayError } from "../Utilities/errorUtils";

// context: vscode.ExtensionContext is for the extension to be able to access the extension path
export async function testOperatorActions(context: vscode.ExtensionContext) {
  try {
    // Prompt user for network URL
    const networkUrl = await vscode.window.showInputBox({
      prompt: "Enter the CCF network URL",
      ignoreFocusOut: true,
      value: "https://127.0.0.1:8000",
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
      openLabel: "Select member0 certificate",
      title: "Select certificate",
      filters: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Pem files": ["pem"],
      },
    });

    // If no file is selected, report it to the user
    if (!signingCert || signingCert.length === 0) {
      vscode.window.showInformationMessage("Member0 certificate is required");
      return;
    }

    // Prompt user for signing key
    const signingKey = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select member0 signing key",
      title: "Select signing key",
      filters: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Pem files": ["pem"],
      },
    });

    // If no file is selected, report it to the user
    if (!signingKey || signingKey.length === 0) {
      vscode.window.showInformationMessage("Member0 signing key is required");
      return;
    }

    // Convert the paths to strings
    const signingCertPath = utilities.getPathOSAgnostic(signingCert[0].fsPath);
    const signingKeyPath = utilities.getPathOSAgnostic(signingKey[0].fsPath);

    // Create the command to run in the terminal
    const command =
      `cd "${
        context.extensionPath + "/dist/scripts"
      }"; ${utilities.getBashCommand()} ` +
      "test_operator_actions.sh" +
      " --address " +
      networkUrl +
      " --signing-cert " +
      signingCertPath +
      " --signing-key " +
      signingKeyPath +
      " --ext-dir " +
      context.extensionPath;

    // Run the command in the terminal
    runCommandInTerminal("Test operator actions Terminal", command);
  } catch (error: any) {
    logAndDisplayError("Operator actions could not be tested.", error);
  }
}
