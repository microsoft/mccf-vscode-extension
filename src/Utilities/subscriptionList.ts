/* eslint-disable prettier/prettier */
import { execSync } from "child_process";
import { window } from "vscode";
import { exec } from "child_process";
import * as vscode from "vscode";
import { azVersion } from "./azureUtilities";

interface Subscription {
  name: string;
  id: string;
}

export async function subscriptionList() {

  azVersion();
  
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
    throw new Error("No subscription selected");
  }

  return selectedSubscription.description;
}
