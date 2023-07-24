import * as vscode from "vscode";
import { execSync } from "child_process";
import { window } from "vscode";

export async function listMCCFInstances() {
  const resourceGroup = await vscode.window.showInputBox({
    prompt: "Enter the resource group:",
  });
  if (!resourceGroup) {
    vscode.window.showErrorMessage(
      "Please enter all the required fields and try again",
    );
    return;
  }
  const message = execSync(
    `az resource list --resource-group ${resourceGroup} --output table --only-show-errors`,
  );
  try {
    const final = message.toString();
    if (final == "") {
      vscode.window.showErrorMessage(
        "No resources found. Please enter a valid resource group and try again",
      );
      return;
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      "An error occurred while retrieving the resources. Please enter a valid resource group and try again",
    );
  }

  interface Subscription {
    name: string;
    id: string;
  }

  // Retrieve a list of subscriptions
  const subscriptionsOutput = execSync(
    "az account list --output json",
  ).toString();
  const subscriptions: Subscription[] = JSON.parse(subscriptionsOutput);

  // Convert the subscriptions to QuickPick items
  const subscriptionItems = subscriptions.map((subscription) => ({
    label: subscription.name,
    description: subscription.id,
  }));

  // Let the user choose a subscription using QuickPick
  const selectedSubscription = await window.showQuickPick(subscriptionItems, {
    placeHolder: "Select a subscription",
    ignoreFocusOut: true,
  });

  if (!selectedSubscription) {
    vscode.window.showErrorMessage("Please select a subscription");
    return;
  }

  const subscriptionId = selectedSubscription.description;

  //command is ran in the terminal
  const command = `az confidentialledger managedccfs list --subscription ${subscriptionId} --resource-group ${resourceGroup} --only-show-errors --query "[].name" -o tsv`;
  let output = execSync(command).toString();
  if (output === "") {
    vscode.window.showErrorMessage(
      "No instances found. Please enter a valid resource group and try again",
    );
  }
  const instances = output.trim().split("\n");
  console.log(instances);

  // This code takes a list of instances and returns a list of items.
  // The instances are converted into items by mapping each instance
  // to an item object.

  const items = instances.map((instance) => ({ label: instance }));
  // Get the selected instance from the user

  const selectedInstance = await vscode.window.showQuickPick(items);
  console.log(selectedInstance?.label);
}
