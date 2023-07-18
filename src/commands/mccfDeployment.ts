import { execSync } from "child_process";
import { window } from "vscode";
import * as vscode from "vscode";
import {subscriptionList} from "./subscriptionList";

interface Subscription {
  name: string;
  id: string;
}

export async function createMCCFInstance() {
  try {
    execSync("az --version");
  } catch (error) {
    console.log(error);
    return console.log("Please install Azure CLI before proceeding: " + error);
  }


  const subscriptionId = subscriptionList();

  // Test Subscription ID (027da7f8-2fc6-46d4-9be9-560706b60fec)

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
    vscode.window.showErrorMessage("Please enter the amount of nodes you want this instance to have");
  }

  resourceGroup = resourceGroup?.toLowerCase();
  console.log(resourceGroup);

  const progressBar = window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  progressBar.text = "$(sync~spin) Creating MCCF instance...";
  progressBar.show();

     // Wait for a few seconds to allow the instance to be created before checking its status
     await new Promise((resolve) => setTimeout(resolve, 5000));

     // Function to check if the MCCF instance was created successfully
     const checkInstanceCreated = () => {
       try {
         // Run the `az confidentialledger managedccfs show` command to get the instance details
         const instanceInfo = execSync(
           `az confidentialledger managedccfs show --name ${names} --resource-group ${resourceGroup} --subscription ${subscriptionId}`
         ).toString();
 
         // Parse the JSON output of the `az confidentialledger managedccfs show` command
         const instanceDetails = JSON.parse(instanceInfo);
 
         // Check the status of the instance (you can customize this based on the output structure)
         if (instanceDetails?.provisioningState === "Succeeded") {
           progressBar.text = "MCCF instance created successfully";
           vscode.window.showInformationMessage("MCCF instance created successfully");
         } else {
           progressBar.text = "MCCF instance creation failed";
           vscode.window.showErrorMessage("Failed to create MCCF instance");
         }
       } catch (error) {
         progressBar.text = "MCCF instance creation failed";
         console.log(error);
         vscode.window.showErrorMessage("Failed to create MCCF instance: " + error);
       } finally {
         progressBar.hide();
       }
     };
 
     // Call the function to check if the instance was created after a delay (you can adjust the delay as needed)
     try {setTimeout(checkInstanceCreated, 15000);
      } catch (error) {
          progressBar.text = "MCCF instance creation failed";
          console.log(error);
          vscode.window.showErrorMessage("Failed to create MCCF instance: " + error);
          progressBar.hide();
   }
}
