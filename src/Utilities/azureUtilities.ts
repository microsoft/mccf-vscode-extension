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
    await withProgressBar("Registering MCCF provider", false, async () => {
      // Register the MCCF feature
      const featureClient = new FeatureClient(new DefaultAzureCredential(), subscriptionId);
      let result = await featureClient.features.register(
        namespaceName,
        featureName
      );
      console.log(result);
      // Register the Microsoft.ConfidentialLedger provider
      const providersClient = new ResourceManagementClient(new DefaultAzureCredential(), subscriptionId);
      result = await providersClient.providers.register(namespaceName);
      console.log(result);
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
    const result = await mccfClient.managedCCFOperations.beginCreateAndWait(
      resourceGroup,
      appName,
      mccf,
    );
    console.log(result);
  } catch (error: any) {
    const errorDetails = JSON.stringify(error, null, 2); // Indent with 2 spaces for readability
    console.error("Error details:", errorDetails);
    logAndThrowError("Failed to create MCCF instance", error);
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
