const {
  ClientSecretCredential,
  DefaultAzureCredential,
} = require("@azure/identity");
import {
  ConfidentialLedgerClient,
  Ledger,
} from "@azure/arm-confidentialledger";
const { SubscriptionClient } = require("@azure/arm-subscriptions");
require("dotenv").config();
import exp = require("constants");
import { ResourceGroup } from "@azure/arm-resources";
import { ResourceManagementClient } from "@azure/arm-resources";
import { QuickPickItem, window } from "vscode";

let credentials: any;

const tenantId = process.env["AZURE_TENANT_ID"];
const clientId = process.env["AZURE_CLIENT_ID"];
const secret = process.env["AZURE_CLIENT_SECRET"];

if (process.env.NODE_ENV && process.env.NODE_ENV === "production") {
  // production
  credentials = new DefaultAzureCredential();
} else {
  // development
  if (tenantId && clientId && secret) {
    console.log("development");
    credentials = new ClientSecretCredential(tenantId, clientId, secret);
  } else {
    credentials = new DefaultAzureCredential();
  }
}

// List the subscriptions for the authenticated account
async function listSubscriptions(
  subscriptionClient: typeof SubscriptionClient,
) {
  // get details of each subscription
  const subscriptions = await subscriptionClient.subscriptions.list();

  // create an array of QuickPickItems from the subscription details
  const subscriptionItems: QuickPickItem[] = subscriptions.map(
    (subscription: any) => {
      return {
        label: subscription.displayName!,
        description: subscription.subscriptionId!,
      };
    },
  );

  // display the QuickPick menu and return the selected subscription ID
  const selectedSubscription = await window.showQuickPick(subscriptionItems, {
    placeHolder: "Select a subscription",
  });
  return selectedSubscription;
}

// List the resource groups in the selected subscription
export async function listResourceGroups(): Promise<string | undefined> {
  try {
    // use credential to authenticate with Azure SDKs
    const credential = new DefaultAzureCredential();
    const subscriptionClient = new SubscriptionClient(credential);
    const subscription = await listSubscriptions(subscriptionClient);

    // create a new instance of the ResourceManagementClient class
    const client = new ResourceManagementClient(
      credential,
      subscription.subscriptionId,
    );

    // retrieve a list of resource groups
    const resourceGroups = await client.resourceGroups.list();

    // create an array of QuickPickItems from the resource group details
    const items: QuickPickItem[] = resourceGroups.map(
      (group: ResourceGroup) => {
        return {
          label: group.name!,
          description: group.id!,
        };
      },
    );

    // display the QuickPick menu and return the selected resource group ID
    const selectedGroup = await window.showQuickPick(items, {
      placeHolder: "Select a resource group",
    });
    return selectedGroup?.description;
  } catch (error) {
    console.error(error);
    window.showErrorMessage("Failed to list resource groups");
  }
}
