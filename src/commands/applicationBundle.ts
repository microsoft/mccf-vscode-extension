import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, posix, sep } from "path";
import * as vscode from "vscode";
import { logAndDisplayError } from "../Utilities/errorUtils";
import { withProgressBar } from "../Utilities/extensionUtils";

export async function applicationBundle() {
  try {
    // Select the app.json file
    const appJsonUri = await vscode.window.showOpenDialog({
      title: "Select CCF application metadata file",
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select metadata file",
      filters: {
        "JSON files": ["json"],
      },
    });

    // If no file is selected, report it to the user
    if (!appJsonUri || !appJsonUri[0]) {
      vscode.window.showErrorMessage("No application file selected");
      return;
    }

    const metadataPath = appJsonUri[0].fsPath;

    // Select the src folder
    const srcUri = await vscode.window.showOpenDialog({
      title: "Select source code folder",
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select source code folder",
    });

    // If no folder is selected, report it to the user
    if (!srcUri || !srcUri[0]) {
      vscode.window.showErrorMessage("No source folder selected");
      return;
    }

    const srcDir = srcUri[0].fsPath;

    // Select the destination folder
    const destUri = await vscode.window.showOpenDialog({
      title: "Select destination folder",
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select destination folder",
    });

    // If no folder is selected, report it to the user
    if (!destUri || !destUri[0]) {
      vscode.window.showErrorMessage("No detination folder selected");
      return;
    }

    const destDir = destUri[0].fsPath;

    // Prompt the user for the bundle file name
    const bundleFileName = await vscode.window.showInputBox({
      prompt: "Enter the name of the bundle file",
      placeHolder: "bundle",
      ignoreFocusOut: true,
    });

    // If no id is entered, report it to the user
    if (!bundleFileName || bundleFileName.length === 0) {
      vscode.window.showErrorMessage("No file name entered");
      return;
    }

    // Prompt the user for the proposal file name
    const proposalFileName = await vscode.window.showInputBox({
      prompt: "Enter the name of the proposal file",
      placeHolder: "set_js_app",
      ignoreFocusOut: true,
    });

    // If no id is entered, report it to the user
    if (!proposalFileName || proposalFileName.length === 0) {
      vscode.window.showErrorMessage("No file name entered");
      return;
    }

    // Start progress bar for creating the bundle
    await withProgressBar(
      "Creating CCF application bundle files",
      false,
      async () => {
        const proposalPath = join(destDir, proposalFileName + ".json");

        console.log("Selected app.json path:", metadataPath);
        console.log("Selected src folder path:", srcDir);
        console.log("Selected destination folder path:", destDir);

        const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

        const allFiles = getAllFiles(srcDir, undefined);

        const modules = allFiles.map(function (filePath: string) {
          return {
            name: removePrefix(filePath, join(srcDir, posix.sep)),
            module: readFileSync(filePath, "utf-8"),
          };
        });

        const bundlePath = join(destDir, bundleFileName + ".json");
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

        // Write the bundle and proposal file name
        writeFileSync(bundlePath, JSON.stringify(bundle));
        writeFileSync(proposalPath, JSON.stringify(appReg));
      },
    );

    vscode.window.showInformationMessage(
      "CCF Application bundle files created successfully",
    );
  } catch (error: any) {
    logAndDisplayError("Error bundling application", error);
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: any | undefined): string[] {
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
}

function removePrefix(s: string, prefix: string) {
  return s.substring(prefix.length).split(sep).join(posix.sep);
}
