import { execSync } from "child_process";
import { window } from "vscode";
import * as vscode from "vscode";
import {
  azureLogin,
  listResourceGroups,
  listSubscriptions,
} from "../Utilities/azureUtilities";

export async function createMCCFInstance() {
  try {
    // Login to Azure CLI
    azureLogin();

    // Get the subscription ID
    const subscriptionId = await listSubscriptions();

    // Get the resource group
    const resourceGroup = (
      await listResourceGroups(subscriptionId)
    )?.toLowerCase();

    // Get the name of the MCCF instance
    const instanceName = await window.showInputBox({
      prompt: "Enter the name of the MCCF instance",
      placeHolder: "my-mccf-instance",
      ignoreFocusOut: true,
    });

    if (!instanceName || instanceName.length === 0) {
      vscode.window.showErrorMessage(
        "Please enter a valid name for the MCCF instance",
      );
      return;
    }

    // Get the member certificate
    const memberCertificate = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select member certificate",
      title: "Select member certificate",
      filters: {
        "Pem files": ["pem"],
      },
    });

    if (!memberCertificate) {
      vscode.window.showErrorMessage(
        "Please enter a valid member certificate file",
      );
      return;
    }

    const memberCertificateString = memberCertificate[0].fsPath;

    // Get the name of the member
    const memberIdentifier = await window.showInputBox({
      prompt: "Enter the member identifier",
      placeHolder: "member0",
      ignoreFocusOut: true,
    });

    if (!memberIdentifier || memberIdentifier.length === 0) {
      vscode.window.showErrorMessage("Please enter a valid member identifier");
      return;
    }

    const numNodes = await window.showInputBox({
      prompt: "Enter the amount of nodes you want this instance to have",
      placeHolder: "3",
      ignoreFocusOut: true,
    });

    if (!numNodes || numNodes.length === 0 || isNaN(Number(numNodes))) {
      vscode.window.showErrorMessage(
        "Please enter a valid positive integer for the number of nodes",
      );
    }

    const progressBar = window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
    );
    progressBar.text = "$(sync~spin) Creating MCCF instance...";
    progressBar.show();

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Creating MCCF instance...",
        cancellable: false,
      },

      async () => {
        execSync(
          `az confidentialledger managedccfs create --members "[{certificate:'${memberCertificateString}',identifier:'${memberIdentifier}}',group:'group1'}]" --node-count ${numNodes} --name ${instanceName} --resource-group ${resourceGroup} --subscription ${subscriptionId} --no-wait false`,
        );
        progressBar.text = "MCCF instance created successfully";
        progressBar.hide();
        vscode.window.showInformationMessage(
          "MCCF instance created successfully",
        );
      },
    );
  } catch (error) {
    console.log(error);
    vscode.window.showErrorMessage(
      "An error occurred while creating the MCCF instance",
    );
  }
}
