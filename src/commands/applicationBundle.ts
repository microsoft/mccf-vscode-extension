import { execSync } from "child_process";
import { runCommandInTerminal } from "../Utilities/terminalUtils";
import * as vscode from "vscode";
import { window } from "vscode";

export async function applicationBundle() {
  try {
    const appDir = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select App File",
      title: "Select Application File",
    });
    execSync(`cd ${appDir}`);
    const progressBar = window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
    );
    progressBar.text = "$(sync~spin) Creating MCCF instance...";
    progressBar.show();
    runCommandInTerminal("Application Bundle", "npm run build");
  } catch (error) {
    console.log(error);
    throw new Error("Application Bundle Process Failed" + error);
  }
}
