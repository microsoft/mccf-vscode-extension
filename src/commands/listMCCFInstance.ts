import * as vscode from "vscode";
import { execSync } from "child_process";
import { subscriptionList } from "./subscriptionList";

export async function listMCCFInstances() {
  const subscriptionId = await subscriptionList();

  const resourceGroup = await vscode.window.showInputBox({
    prompt: "Enter the resource group:",
  });
  if (!resourceGroup) {
    vscode.window.showErrorMessage(
      "Please enter all the required fields and try again",
    );
    return;
  }

  try {
    const message = execSync(
      `az resource list --resource-group ${resourceGroup} --output table --only-show-errors`,
    );

    const final = message.toString();
    if (final === "") {
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

  // command is ran in the terminal
  const command = `az confidentialledger managedccfs list --subscription ${subscriptionId} --resource-group ${resourceGroup.toLowerCase()} --only-show-errors --query "[].name" -o tsv`;
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

  vscode.window.showInformationMessage(
    `Selected instance: ${selectedInstance?.label}`,
  );
}
