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
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Creating MCCF instance...",
        cancellable: false,
      },
      async () => {
        runCommandInTerminal("Application Bundle", "npm run build");
        progressBar.text = "MCCF instance created successfully";
        progressBar.hide();
        vscode.window.showInformationMessage(
          "MCCF instance created successfully",
        );
      },
    );
  } catch (error) {
    console.log(error);
    throw new Error("Application Bundle Process Failed" + error);
  }
}
