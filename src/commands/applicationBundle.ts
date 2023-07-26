import { execSync } from "child_process";
import { runCommandInTerminal } from "../Utilities/terminalUtils";
import * as vscode from "vscode";
import { window } from "vscode";

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

    //Get path of app directory and store it in appDirString
    const appDirArray = await appDir;
    if (!appDirArray) {
      throw new Error("No app directory selected");
    }
    const appDirString = appDirArray[0].fsPath;

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
        runCommandInTerminal(
          "Application Bundle",
          `cd ${appDirArray}; npm run build`,
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
