import * as vscode from "vscode";
import * as fs from "fs";
import {
  listResourceGroups,
  listSubscriptions,
  showMCCFInstanceDetails,
  createInstance,
  azureMCCFSetup,
} from "../Utilities/azureUtilities";
import { withProgressBar } from "../Utilities/extensionUtils";
import { logAndDisplayError } from "../Utilities/errorUtils";

const languageJS = {
  label: "JavaScript",
  description: "Javascript CCF application",
  value: "JS",
};

const languageCPP = {
  label: "CPP",
  description: "C++ CCF application",
  value: "CPP",
};

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
    // Get the subscription ID
    const subscriptionId = await listSubscriptions();

    // Check if the subscription has been setup for MCCF
    azureMCCFSetup(subscriptionId);

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
      vscode.window.showErrorMessage("No region was selected");
      return;
    }

    const languageRuntime = await vscode.window.showQuickPick(
      [languageJS, languageCPP],
      {
        title: "Select the language runtime",
        ignoreFocusOut: true,
      },
    );

    if (!languageRuntime) {
      vscode.window.showErrorMessage("No language runtime was selected");
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
      vscode.window.showErrorMessage("No application type was selected");
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
        "Please select a valid member certificate file",
      );
      return;
    }

    const memberCertificateString = memberCertificate[0].fsPath;
    const certificateString = fs.readFileSync(memberCertificateString, "utf8");

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
      return;
    }

    // Create the MCCF resource
    await withProgressBar(
      "Creating Azure Managed CCF resource, this may take a while.",
      false,
      async () => {
        await createInstance(
          region.value,
          applicationType.value,
          languageRuntime.value,
          certificateString,
          subscriptionId,
          resourceGroup,
          instanceName,
          Number(numNodes),
        );
      },
    );

    vscode.window.showInformationMessage(
      "Azure Managed CCF resource was created successfully",
    );

    // Show the details of the MCCF instance in the output channel
    await showMCCFInstanceDetails(instanceName, resourceGroup, subscriptionId);
  } catch (error: any) {
    logAndDisplayError("Failed to create MCCF instance", error);
  }
}
