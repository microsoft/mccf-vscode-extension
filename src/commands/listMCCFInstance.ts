import * as vscode from "vscode";
import { execSync } from "child_process";
import {
  azureLogin,
  listResourceGroups,
  listSubscriptions,
} from "../Utilities/azureUtilities";

export async function listMCCFInstances() {
  try {
    // Login to Azure CLI
    azureLogin();

    // Get the subscription ID
    const subscriptionId = await listSubscriptions();

    // Get the resource group
    const resourceGroup = (
      await listResourceGroups(subscriptionId)
    )?.toLowerCase();

    //command is ran in the terminal
    const command = `az confidentialledger managedccfs list --subscription ${subscriptionId} --resource-group ${resourceGroup} --only-show-errors --query "[].name" -o tsv`;
    let output = execSync(command).toString();

    if (output === "") {
      vscode.window.showInformationMessage(
        "No MCCF instances found in the selected subscription and resource group",
      );
      return;
    }
    const mccfInstances = output.trim().split("\n");
    console.log("MCCF instances: " + mccfInstances);

    // This code takes a list of instances and returns a list of items.
    // The instances are converted into items by mapping each instance
    // to an item object.
    const items = mccfInstances.map((instance) => ({ label: instance }));

    // Get the selected instance from the user
    const selectedInstance = await vscode.window.showQuickPick(items);
    console.log(selectedInstance?.label);
  } catch (error) {
    console.log(error);
    vscode.window.showErrorMessage(
      "An error occurred while listing the MCCF instances",
    );
  }
}
