import * as vscode from "vscode";
import { executeCommandAsync } from "./asyncUtils";
import { showOutputInChannel, withProgressBar } from "./extensionUtils";
import { logAndThrowError } from "./errorUtils";
import { SubscriptionClient } from "@azure/arm-subscriptions";
import { DefaultAzureCredential } from "@azure/identity";
import {ResourceManagementClient} from "@azure/arm-resources";
import { ConfidentialLedgerClient } from "@azure/arm-confidentialledger";

// Check if Azure CLI is installed by running the command "az --version"
export async function checkAzureCli() {
  try {
    await executeCommandAsync("az --version");
  } catch (error: any) {
    logAndThrowError("Failed to check Azure CLI", error);
  }
}

// Login to Azure CLI by running the command "az login"
export async function azureLogin() {
  try {
    await withProgressBar("Logging into Azure", false, async () => {
      await checkAzureCli();
      const accountOutput = await executeCommandAsync("az account show");
      const account = JSON.parse(accountOutput.toString());
      if (!account.id) {
        await executeCommandAsync("az login");
      }
    });
  } catch (error: any) {
    logAndThrowError("Failed to login to Azure", error);
  }
}

// Setup Azure Managed CCF
export async function azureMCCFSetup() {
  try {
    await withProgressBar("Registering MCCF provider", false, async () => {
      // Register the MCCF feature
      await executeCommandAsync(
        "az feature registration create --namespace Microsoft.ConfidentialLedger --name ManagedCCF",
      );

      // Register the Microsoft.ConfidentialLedger provider
      await executeCommandAsync(
        "az provider register --namespace Microsoft.ConfidentialLedger",
      );
    });
  } catch (error: any) {
    logAndThrowError("Failed to setup Azure Managed CCF", error);
  }
}

// Subscription interface
interface Subscription {
  name: string;
  id: string;
}

// Show a list of subscriptions and let the user choose one
export async function listSubscriptions() {
  try {
    let subscriptionArray = new Array(); 

    // Retrieve a list of subscriptions
    await withProgressBar("Getting subscriptions", false, async () => {
      const subscriptionClient = new SubscriptionClient(new DefaultAzureCredential());
      const subscriptions = await subscriptionClient.subscriptions.list();
      for await (let item of subscriptions) {
        subscriptionArray.push({
          label: item.displayName,
          description: item.subscriptionId,
        });
      }
    });

    // Let the user choose a subscription using QuickPick
    const selectedSubscription = await vscode.window.showQuickPick(
      subscriptionArray,
      {
        title: "Select a subscription",
        ignoreFocusOut: true,
      },
    );

    if (!selectedSubscription) {
      throw new Error("No subscription selected");
    }

    return selectedSubscription.subscriptionId;
  } catch (error: any) {
    logAndThrowError("Failed to list subscriptions", error);
    return "";
  }
}

// List the resource groups in the selected subscription
export async function listResourceGroups(subscriptionId: string) {
  try {
    let resourceGroupArray = new Array(); 

    // Retrieve a list of Resource Groups
    await withProgressBar("Getting resource groups", false, async () => {
      const resourceClient  = new ResourceManagementClient(new DefaultAzureCredential(), subscriptionId);
      const resourceGroups = await resourceClient.resourceGroups.list();
      for await (let item of resourceGroups) {
        resourceGroupArray.push({
          label: item.id,
          description: item.name,
        });
      }
    });

    // Let the user choose a resource group using QuickPick
    const selectedRG = await vscode.window.showQuickPick(resourceGroupArray, {
      title: "Select a resource group",
      ignoreFocusOut: true,
    });

    if (!selectedRG) {
      throw new Error("No resource group selected");
    }

    return selectedRG;
  } catch (error: any) {
    logAndThrowError("Failed to list resource groups", error);
    return "";
  }
}

// Show details of an MCCF instance
export async function showMCCFInstanceDetails(
  instanceName: string,
  resourceGroup: string,
  subscriptionId: string,
) {
  let mccfInstanceDetails: string = "{}";

  await withProgressBar(
    "Getting details for the MCCF instance",
    false,
    async () => {
      const mccfClient = new ConfidentialLedgerClient(new DefaultAzureCredential(), subscriptionId);

      mccfInstanceDetails = mccfClient.managedCCFOperations.get(
        resourceGroup,
        instanceName,
      ).toString();
    },
  );

  const mccfInstanceDetailsJson = JSON.stringify(
    JSON.parse(mccfInstanceDetails.toString()),
    null,
    2,
  );

  // Show the details of the MCCF instance in the output channel
  showOutputInChannel(
    `MCCF instance view - ${instanceName}`,
    mccfInstanceDetailsJson,
  );
}
