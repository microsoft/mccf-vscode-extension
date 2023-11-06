import * as vscode from "vscode";
import { getMCCFInstances, deleteInstance } from "../Utilities/azureUtilities";
import { withProgressBar } from "../Utilities/extensionUtils";
import { logAndDisplayError } from "../Utilities/errorUtils";

export async function deleteMCCFInstance() {
  try {
    const res = await getMCCFInstances();

    // Delete the MCCF resource
    await withProgressBar(
      "Deleting Azure Managed CCF resource",
      false,
      async () => {
        await deleteInstance(res.subscription, res.resourceGroup, res.instance);
      },
    );

    vscode.window.showInformationMessage(
      "Azure Managed CCF resource was deleted successfully",
    );
  } catch (error: any) {
    logAndDisplayError("Failed to delete MCCF instance", error);
  }
}
