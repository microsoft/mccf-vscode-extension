import { execSync } from "child_process";
import { runCommandInTerminal } from "../Utilities/terminalUtils";
import * as vscode from "vscode";
import { window } from "vscode";
import { applicationBundleSource } from "../Utilities/applicationBundleSource";

export async function applicationBundle() {
  try {
    //Create a open dialog that allows the user to select the specific app directory
    const appDir = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select project folder",
      title: "Select project folder",
    });

    // If the user cancels the dialog, return
    if (!appDir) {
      throw new Error("No app directory selected");
    }
    //Get path of app directory
    const appDirPath = appDir[0].fsPath;

    const progressBar = window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
    );
    progressBar.text = "$(sync~spin) Creating Application Bundle...";
    progressBar.show();
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Creating Application Bundle...",
        cancellable: false,
      },
      async () => {
        await applicationBundleSource(appDirPath);
        runCommandInTerminal(
          "Application Bundle",
          `cd ${appDirPath}; npm run build`,
        );
        progressBar.text = "Application Bundle created successfully";
        progressBar.hide();
        vscode.window.showInformationMessage(
          "Application Bundle  successfully",
        );
      },
    );
  } catch (error) {
    console.log(error);
    throw new Error("Application Bundle Process Failed" + error);
  }
}
