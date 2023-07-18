import { execSync } from "child_process";
import { window } from "vscode";
import * as vscode from "vscode";
import { subscriptionList } from "./subscriptionList";

export async function createMCCFInstance() {
  try {
    execSync("az --version");
  } catch (error) {
    console.log(error);
    return console.log("Please install Azure CLI before proceeding: " + error);
  }

  const subscriptionId = subscriptionList();

  const certificateDir = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: "Select Certificate",
    title: "Select Certificate",
  });

  if (!certificateDir) {
    vscode.window.showErrorMessage(
      "Please enter a directory for the certificate",
    );
    return;
  }
  const certificateDirString = certificateDir[0].fsPath;
  const identifier = await window.showInputBox({
    prompt: "Enter the identifier:",
  });
  const names = await window.showInputBox({
    prompt: "Enter the name of your CCF Network",
  });
  let resourceGroup = await window.showInputBox({
    prompt: "Enter the resource group you want this instance to be placed",
  });
  const nodes = await window.showInputBox({
    prompt: "Enter the amount of nodes you want this instance to have",
  });

  if (!certificateDir) {
    vscode.window.showErrorMessage(
      "Please enter a directory for the certificate",
    );
  } else if (!identifier) {
    vscode.window.showErrorMessage("Please enter an identifier");
  } else if (!names) {
    vscode.window.showErrorMessage("Please enter a name for your CCF Network");
  } else if (!resourceGroup) {
    vscode.window.showErrorMessage("Please enter a resource group");
  } else if (!nodes) {
    vscode.window.showErrorMessage(
      "Please enter the amount of nodes you want this instance to have",
    );
  }

  resourceGroup = resourceGroup?.toLowerCase();
  console.log(resourceGroup);

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
      try {
        await execSync(
          `az confidentialledger managedccfs create --members "[{certificate:'${certificateDirString}',identifier:'${identifier}}',group:'group1'}]" --node-count ${nodes} --name ${names} --resource-group ${resourceGroup} --subscription ${subscriptionId} --no-wait false`,
        );
        progressBar.text = "MCCF instance created successfully";
        progressBar.hide();
        vscode.window.showInformationMessage(
          "MCCF instance created successfully",
        );
      } catch (error) {
        progressBar.text = "MCCF instance creation failed";
        progressBar.hide();
        console.log(error);
        vscode.window.showErrorMessage(
          "Failed to create MCCF instance: " + error,
        );
      }
    },
  );
}
