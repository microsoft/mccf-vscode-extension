import { execSync } from "child_process";
import { ProgressLocation, window } from "vscode";

// Check if Azure CLI is installed by running the command "az --version"
export function checkAzureCli() {
  try {
    execSync("az --version");
  } catch (error) {
    console.log(error);
    throw new Error("Failed to execute Azure CLI command: " + error);
  }
}

// Login to Azure CLI by running the command "az login"
export function azureLogin() {
  try {
    checkAzureCli();
    execSync("az login");
  } catch (error) {
    console.log(error);
    throw new Error("Failed to execute az login command: " + error);
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
    checkAzureCli();

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
      window.showErrorMessage("Please select a subscription");
      throw new Error("No subscription selected");
    }

    return selectedSubscription.description;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to list subscriptions: " + error);
  }
}

// List the resource groups in the selected subscription
export async function listResourceGroups(subscriptionId: string) {
  try {
    checkAzureCli();

    // Run the command to list the resource groups
    const message = execSync(
      `az group list --subscription ${subscriptionId} --query "[].name" --output json`,
    );

    const resourceGroups = JSON.parse(message.toString());

    // Let the user choose a resource group using QuickPick
    const selectedRG = await window.showQuickPick(resourceGroups, {
      placeHolder: "Select a resource group",
      ignoreFocusOut: true,
    });

    if (!selectedRG) {
      window.showErrorMessage("Please select a resource group");
      throw new Error("No resource group selected");
    }

    return selectedRG;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to list resource groups: " + error);
  }
}
