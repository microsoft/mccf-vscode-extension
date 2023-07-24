import { execSync } from "child_process";

export async function azVersion() {
  try {
    execSync("az --version");
  } catch (error) {
    console.log(error);
    throw new Error("Please Install Azure CLI before proceeding");
  }
}
