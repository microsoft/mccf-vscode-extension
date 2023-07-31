import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, posix, sep } from "path";
import * as vscode from "vscode";

export async function applicationBundle() {
  try {
    const options: vscode.OpenDialogOptions = {
      canSelectFolders: true,
      openLabel: "Select",
    };

    // Select the app.json file
    const appJsonUri = await vscode.window.showOpenDialog({
      title: "Select app.json",
      canSelectFiles: true,
      canSelectFolders: false,
      openLabel: "Select app.json",
    });
    if (!appJsonUri || !appJsonUri[0]) {
      return;
    }
    const metadataPath = appJsonUri[0].fsPath;

    // Select the src folder
    const srcUri = await vscode.window.showOpenDialog({
      title: "Select src folder",
      canSelectFiles: false,
      canSelectFolders: true,
      openLabel: "Select src folder",
    });
    if (!srcUri || !srcUri[0]) {
      return;
    }
    const srcDir = srcUri[0].fsPath;

    // Select the destination folder
    const destUri = await vscode.window.showOpenDialog({
      title: "Select destination folder",
      canSelectFiles: false,
      canSelectFolders: true,
      openLabel: "Select destination folder",
    });
    if (!destUri || !destUri[0]) {
      return;
    }
    const rootDir = destUri[0].fsPath;

    // Prompt the user for the proposal file name
    const proposalFileName = await vscode.window.showInputBox({
      prompt: "Enter the name of the proposal file",
      value: "set_js_app.json",
    });
    if (!proposalFileName) {
      return;
    }
    const appRegPath = join(rootDir, proposalFileName);

    console.log("Selected app.json path:", metadataPath);
    console.log("Selected src folder path:", srcDir);
    console.log("Selected destination folder path:", rootDir);

    const getAllFiles = function (
      dirPath: string,
      arrayOfFiles: any | undefined,
    ): string[] {
      arrayOfFiles = arrayOfFiles || [];

      const files = readdirSync(dirPath);
      for (const file of files) {
        const filePath = join(dirPath, file);
        if (statSync(filePath).isDirectory()) {
          arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
          arrayOfFiles.push(filePath);
        }
      }

      return arrayOfFiles;
    };

    const removePrefix = function (s: string, prefix: string) {
      return s.substr(prefix.length).split(sep).join(posix.sep);
    };

    const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

    const allFiles = getAllFiles(srcDir, undefined);

    const toTrim = srcDir + "/";

    const modules = allFiles.map(function (filePath: string) {
      return {
        name: removePrefix(filePath, toTrim),
        module: readFileSync(filePath, "utf-8"),
      };
    });

    const bundlePath = join(rootDir, "bundle.json");
    const bundle = {
      metadata: metadata,
      modules: modules,
    };
    const appReg = {
      actions: [
        {
          name: "set_js_app",
          args: {
            bundle: bundle,
            disableBytecodeCache: false,
          },
        },
      ],
    };

    console.log(
      `Writing bundle containing ${modules.length} modules to ${bundlePath}`,
    );

    // Create a progress bar
    const progress = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
    );
    progress.text = "Writing bundle...";
    progress.show();

    // Write the bundle and app registration files
    writeFileSync(bundlePath, JSON.stringify(bundle));
    writeFileSync(appRegPath, JSON.stringify(appReg));

    // Update the progress bar
    progress.text = "Bundle written!";
    setTimeout(() => {
      progress.dispose();
    }, 3000);
  } catch (error) {
    console.error(error);
    throw new Error("Application Bundle Process Failed" + error);
  }
}
