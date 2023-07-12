import * as vscode from "vscode";
import { execSync } from "child_process";

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


//command is ran in the terminal
const command = `az confidentialledger managedccfs list --subscription 027da7f8-2fc6-46d4-9be9-560706b60fec --resource-group ${resourceGroup} --only-show-errors --query "[].name" -o tsv`;
  let output = execSync(command).toString();
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
