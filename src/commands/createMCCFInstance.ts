import * as vscode from "vscode";
import {
  azureLogin,
  listResourceGroups,
  listSubscriptions,
  showMCCFInstanceDetails,
} from "../Utilities/azureUtilities";
import { withProgressBar } from "../Utilities/extensionUtils";
import { executeCommandAsync } from "../Utilities/asyncUtils";
import { logAndDisplayError } from "../Utilities/errorUtils";

const customAppOption = {
  label: "Custom app",
  description: "Custom CCF application",
  value: "customImage",
};

const sampleAppOption = {
  label: "Sample app",
  description: "Sample CCF application (banking app)",
  value: "sample",
};

const scusRegionOption = {
  label: "South Central US",
  value: "southcentralus",
};

const weuRegionOption = {
  label: "West Europe",
  value: "westeurope",
};

export async function createMCCFInstance() {
  try {
    // Login to Azure CLI
    await azureLogin();

    // Get the subscription ID
    const subscriptionId = await listSubscriptions();

    // Get the resource group
    const resourceGroup = (
      await listResourceGroups(subscriptionId)
    )?.toLowerCase();

    // Get the name of the MCCF instance
    const instanceName = await vscode.window.showInputBox({
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

    const region = await vscode.window.showQuickPick(
      [scusRegionOption, weuRegionOption],
      {
        title: "Select the Azure region",
        ignoreFocusOut: true,
      },
    );

    if (!region) {
      vscode.window.showInformationMessage("No region was selected");
      return;
    }

    const applicationType = await vscode.window.showQuickPick(
      [customAppOption, sampleAppOption],
      {
        title: "Select the application type",
        ignoreFocusOut: true,
      },
    );

    if (!applicationType) {
      vscode.window.showInformationMessage("No application type was selected");
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
    const memberIdentifier = await vscode.window.showInputBox({
      prompt: "Enter the member identifier",
      placeHolder: "member0",
      ignoreFocusOut: true,
    });

    if (!memberIdentifier || memberIdentifier.length === 0) {
      vscode.window.showErrorMessage("Please enter a valid member identifier");
      return;
    }

    const numNodes = await vscode.window.showInputBox({
      prompt: "Enter the amount of nodes you want this instance to have",
      placeHolder: "3",
      ignoreFocusOut: true,
    });

    if (!numNodes || numNodes.length === 0 || isNaN(Number(numNodes))) {
      vscode.window.showErrorMessage(
        "Please enter a valid positive integer for the number of nodes",
      );
    }

    // Create the MCCF resource
    await withProgressBar(
      "Creating Azure Managed CCF resource",
      false,
      async () => {
        await executeCommandAsync(
          `az confidentialledger managedccfs create --members "[{certificate:'${memberCertificateString}',identifier:'${memberIdentifier}}',group:'group1'}]" --location ${region.value} --app-type ${applicationType.value} --node-count ${numNodes} --name ${instanceName} --resource-group ${resourceGroup} --subscription ${subscriptionId} --no-wait false`,
        );
      },
    );

    vscode.window.showInformationMessage(
      "Azure Managed CCF resource was created successfully",
    );

    // Wait for MCCF instance to be initialized
    await withProgressBar(
      "Waiting for the MCCF instance to be initialized. This may take a while.",
      false,
      async () => {
        await executeCommandAsync(
          `az confidentialledger managedccfs wait --name ${instanceName} --resource-group ${resourceGroup} --subscription ${subscriptionId} --created --timeout 600`,
        );
      },
    );

    vscode.window.showInformationMessage(
      "The MCCF instance is up and running!",
    );

    // Show the details of the MCCF instance in the output channel
    showMCCFInstanceDetails(instanceName, resourceGroup, subscriptionId);
  } catch (error: any) {
    logAndDisplayError("Failed to create MCCF instance", error);
  }
}
