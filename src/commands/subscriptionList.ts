import { execSync } from "child_process";
import { window } from "vscode";
const { exec } = require("child_process");
import * as vscode from "vscode";

interface Subscription {
  name: string;
  id: string;
}

export async function subscriptionList() {
  try {
    exec("az --version", (error: any) => {
      if (error) {
        console.log(error);
        return console.log(
          "Please install Azure CLI before proceeding: " + error,
        );
      }
    });
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
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

  return selectedSubscription.description;
}
