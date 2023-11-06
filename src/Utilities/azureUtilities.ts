import * as vscode from "vscode";
import { showOutputInChannel, withProgressBar } from "./extensionUtils";
import { logAndThrowError } from "./errorUtils";
import { SubscriptionClient } from "@azure/arm-subscriptions";
import { DefaultAzureCredential } from "@azure/identity";
import { FeatureClient } from "@azure/arm-features";
import { ResourceManagementClient } from "@azure/arm-resources";
import {
  ConfidentialLedgerClient,
  ManagedCCF,
} from "@azure/arm-confidentialledger";

const namespaceName = "Microsoft.ConfidentialLedger";
const featureName = "ManagedCCF";

// Setup Azure Managed CCF
export async function azureMCCFSetup(subscriptionId: string) {
  try {
    const featureClient = new FeatureClient(
      new DefaultAzureCredential(),
      subscriptionId,
    );

    let isRegistered: boolean = false;

    await withProgressBar(
      "Checking if the MCCF feature is registered",
      false,
      async () => {
        const status = await featureClient.features.get(
          namespaceName,
          featureName,
        );
        if (status != null && status.properties?.state == "Registered") {
          vscode.window.showInformationMessage(
            "The MCCF feature is already registered",
          );
          isRegistered = true;
        }
      },
    );

    if (isRegistered) {
      return;
    }

    await withProgressBar("Registering MCCF provider", false, async () => {
      // Register the MCCF feature
      let result = await featureClient.features.register(
        namespaceName,
        featureName,
      );

      // Register the Microsoft.ConfidentialLedger provider
      const providersClient = new ResourceManagementClient(
        new DefaultAzureCredential(),
        subscriptionId,
      );
      result = await providersClient.providers.register(namespaceName);
    });
  } catch (error: any) {
    logAndThrowError("Failed to setup Azure Managed CCF", error);
  }
}

// Create a MCCF instance
export async function createInstance(
  location: string,
  appSource: string,
  language: string,
  cert: string,
  subscriptionId: string,
  resourceGroup: string,
  appName: string,
  nodecount: number,
) {
  try {
    const mccf: ManagedCCF = {
      location: location,
      properties: {
        deploymentType: {
          appSourceUri: appSource,
          languageRuntime: language,
        },
        memberIdentityCertificates: [
          {
            certificate: cert,
          },
        ],
        nodeCount: nodecount,
      },
    };

    const mccfClient = new ConfidentialLedgerClient(
      new DefaultAzureCredential(),
      subscriptionId,
    );
    await mccfClient.managedCCFOperations.beginCreateAndWait(
      resourceGroup,
      appName,
      mccf,
    );
  } catch (error: any) {
    logAndThrowError("Failed to create MCCF instance", error);
  }
}

// Delete a MCCF instance
export async function deleteInstance(
  subscriptionId: string,
  resourceGroup: string,
  appName: string,
) {
  try {
    const mccfClient = new ConfidentialLedgerClient(
      new DefaultAzureCredential(),
      subscriptionId,
    );
    await mccfClient.managedCCFOperations.beginDeleteAndWait(
      resourceGroup,
      appName,
    );
  } catch (error: any) {
    logAndThrowError("Failed to delete MCCF instance", error);
  }
}

// Show a list of subscriptions and let the user choose one
export async function listSubscriptions() {
  try {
    let subscriptionArray = new Array();

    // Retrieve a list of subscriptions
    await withProgressBar("Getting subscriptions", false, async () => {
      const subscriptionClient = new SubscriptionClient(
        new DefaultAzureCredential(),
      );
      const subscriptions = await subscriptionClient.subscriptions.list();
      for await (let item of subscriptions) {
        subscriptionArray.push({
          label: item.displayName,
          description: item.subscriptionId,
        });
      }
    });

    if (subscriptionArray.length === 0) {
      throw new Error("No subscription found");
    }

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

    return selectedSubscription.description;
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
      const resourceClient = new ResourceManagementClient(
        new DefaultAzureCredential(),
        subscriptionId,
      );
      const resourceGroups = await resourceClient.resourceGroups.list();
      for await (let item of resourceGroups) {
        resourceGroupArray.push(item.name);
      }
    });

    if (resourceGroupArray.length === 0) {
      throw new Error("No resource group found");
    }

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

// Get mccf instances from a given subscription and resource group
export async function getMCCFInstances(): Promise<{
  subscription: string;
  resourceGroup: string;
  instance: string;
}> {
  try {
    // Get the subscription ID
    const subscriptionId = await exports.listSubscriptions();

    // Check if the subscription has been setup for MCCF
    azureMCCFSetup(subscriptionId);

    // Get the resource group
    const resourceGroup = (
      await exports.listResourceGroups(subscriptionId)
    )?.toLowerCase();

    const mccfInstances = new Array();

    // Run command to list MCCF instances
    await withProgressBar("Getting MCCF instances", false, async () => {
      const mccfClient = new ConfidentialLedgerClient(
        new DefaultAzureCredential(),
        subscriptionId,
      );
      const mccfApps =
        await mccfClient.managedCCFOperations.listByResourceGroup(
          resourceGroup,
        );

      for await (let item of mccfApps) {
        mccfInstances.push(item.name);
      }

      if (mccfInstances.length === 0) {
        vscode.window.showInformationMessage(
          "No MCCF instances found in the selected subscription and resource group",
        );
        throw new Error(
          "No MCCF instances found in the selected subscription and resource group",
        );
      }
    });

    // Get the selected instance from the user
    const selectedInstance = await vscode.window.showQuickPick(mccfInstances, {
      title: "Select a MCCF instance",
      ignoreFocusOut: true,
    });

    if (!selectedInstance) {
      vscode.window.showErrorMessage("No MCCF instance selected");
      throw new Error("No MCCF instance selected");
    }

    return {
      subscription: subscriptionId,
      resourceGroup: resourceGroup,
      instance: selectedInstance,
    };
  } catch (error: any) {
    logAndThrowError("Failed to get MCCF instance name", error);
    return { subscription: "", resourceGroup: "", instance: "" };
  }
}

// Show details of an MCCF instance
export async function showMCCFInstanceDetails(
  instanceName: string,
  resourceGroup: string,
  subscriptionId: string,
) {
  try {
    let mccfInstanceDetails: ManagedCCF | null = null;

    await withProgressBar(
      "Getting details for the MCCF instance",
      false,
      async () => {
        const mccfClient = new ConfidentialLedgerClient(
          new DefaultAzureCredential(),
          subscriptionId,
        );

        mccfInstanceDetails = await mccfClient.managedCCFOperations.get(
          resourceGroup,
          instanceName,
        );
      },
    );

    const mccfInstanceDetailsJson = JSON.stringify(
      mccfInstanceDetails,
      null,
      2,
    );

    // Show the details of the MCCF instance in the output channel
    showOutputInChannel(
      `MCCF instance view - ${instanceName}`,
      mccfInstanceDetailsJson,
    );
  } catch (error: any) {
    logAndThrowError("Failed to get MCCF instance details", error);
  }
}
