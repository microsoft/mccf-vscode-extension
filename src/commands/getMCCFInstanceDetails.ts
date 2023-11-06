import {
  getMCCFInstances,
  showMCCFInstanceDetails,
} from "../Utilities/azureUtilities";
import { logAndDisplayError } from "../Utilities/errorUtils";

export async function getMCCFInstanceDetails() {
  try {
    const res = await getMCCFInstances();

    // Show the details of the MCCF instance in the output channel
    showMCCFInstanceDetails(res.subscription, res.resourceGroup, res.instance);
  } catch (error: any) {
    logAndDisplayError("Failed to list MCCF instances", error);
  }
}
