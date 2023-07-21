import { runCommandInTerminal } from "./terminalUtils";

export async function azureLogin() {
  try {
    runCommandInTerminal("Azure Login", "az login");
  } catch (error) {
    console.log(error);
    throw new Error("Please Install Azure CLI before proceeding");
  }
}
