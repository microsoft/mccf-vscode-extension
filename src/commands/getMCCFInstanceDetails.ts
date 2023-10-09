import * as vscode from "vscode";
import {
  listResourceGroups,
  listSubscriptions,
  showMCCFInstanceDetails,
} from "../Utilities/azureUtilities";
import { withProgressBar } from "../Utilities/extensionUtils";
import { logAndDisplayError } from "../Utilities/errorUtils";
import { ConfidentialLedgerClient } from "@azure/arm-confidentialledger";
import { DefaultAzureCredential } from "@azure/identity";

export async function getMCCFInstanceDetails() {
  try {
    // Get the subscription ID
    const subscriptionId = await listSubscriptions();

    // Get the resource group
    const resourceGroup = (
      await listResourceGroups(subscriptionId)
    )?.toLowerCase();

    const mccfInstances = new Array();

    // Run command to list MCCF instances
    await withProgressBar("Getting MCCF instances", false, async () => {
      const mccfClient = new ConfidentialLedgerClient(new DefaultAzureCredential(), subscriptionId);
      const mccfApps = await mccfClient.managedCCFOperations.listByResourceGroup(resourceGroup);
      
      for await (let item of mccfApps) {
        mccfInstances.push(item);
      }

      if (mccfInstances.length === 0) {
        vscode.window.showInformationMessage(
          "No MCCF instances found in the selected subscription and resource group",
        );
        return;
      }
    });

    // This code takes a list of instances and returns a list of items.
    // The instances are converted into items by mapping each instance
    // to an item object.
    const items = mccfInstances.map((instance) => ({ label: instance }));

    // Get the selected instance from the user
    const selectedInstance = await vscode.window.showQuickPick(items, {
      title: "Select a MCCF instance",
      ignoreFocusOut: true,
    });

    if (!selectedInstance) {
      vscode.window.showErrorMessage("No MCCF instance selected");
      return;
    }

    // Show the details of the MCCF instance in the output channel
    showMCCFInstanceDetails(
      selectedInstance.label,
      resourceGroup,
      subscriptionId,
    );
  } catch (error: any) {
    logAndDisplayError("Failed to list MCCF instances", error);
  }
}
