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

export async function getMCCFInstanceDetails() {
  try {
    // Login to Azure
    await azureLogin();

    // Get the subscription ID
    const subscriptionId = await listSubscriptions();

    // Get the resource group
    const resourceGroup = (
      await listResourceGroups(subscriptionId)
    )?.toLowerCase();

    let mccfInstances: string[] = [];

    // Run command to list MCCF instances
    await withProgressBar("Getting MCCF instances", false, async () => {
      const mccfListOutput = await executeCommandAsync(
        `az confidentialledger managedccfs list --subscription ${subscriptionId} --resource-group ${resourceGroup} --only-show-errors --query "[].name" -o json`,
      );

      if (mccfListOutput === "") {
        vscode.window.showInformationMessage(
          "No MCCF instances found in the selected subscription and resource group",
        );
        return;
      }

      mccfInstances = JSON.parse(mccfListOutput.toString());
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
