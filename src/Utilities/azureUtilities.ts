import * as vscode from "vscode";
import { executeCommandAsync } from "./asyncUtils";
import { showOutputInChannel, withProgressBar } from "./extensionUtils";
import { logAndThrowError } from "./errorUtils";

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
    let subscriptions: Subscription[] = [];

    // Retrieve a list of subscriptions
    await withProgressBar("Getting subscriptions", false, async () => {
      const subscriptionsOutput = await executeCommandAsync(
        "az account list --output json",
      );

      subscriptions = JSON.parse(subscriptionsOutput);
    });

    // Convert the subscriptions to QuickPick items
    const subscriptionItems = subscriptions.map((subscription) => ({
      label: subscription.name,
      description: subscription.id,
    }));

    // Let the user choose a subscription using QuickPick
    const selectedSubscription = await vscode.window.showQuickPick(
      subscriptionItems,
      {
        title: "Select a subscription",
        ignoreFocusOut: true,
      },
    );

    if (!selectedSubscription) {
      throw new Error("No subscription selected");
    }

    return selectedSubscription.description;
  } catch (error: any) {
    logAndThrowError("Failed to list subscriptions", error);
    return "";
  }
}

// List the resource groups in the selected subscription
export async function listResourceGroups(subscriptionId: string) {
  try {
    let resourceGroups: string[] = [];

    // Retrieve a list of Resource Groups
    await withProgressBar("Getting resource groups", false, async () => {
      const rgOutput = await executeCommandAsync(
        `az group list --subscription ${subscriptionId} --query "[].name" --output json`,
      );

      resourceGroups = JSON.parse(rgOutput.toString());
    });

    // Let the user choose a resource group using QuickPick
    const selectedRG = await vscode.window.showQuickPick(resourceGroups, {
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
      mccfInstanceDetails = await executeCommandAsync(
        `az confidentialledger managedccfs show --name ${instanceName} --resource-group ${resourceGroup} --subscription ${subscriptionId} --output json`,
      );
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
