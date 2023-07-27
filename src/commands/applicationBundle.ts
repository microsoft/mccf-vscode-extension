import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, posix, sep } from "path";
import * as vscode from "vscode";

export async function applicationBundle() {
  try {
    const options: vscode.OpenDialogOptions = {
      canSelectFolders: true, // Set to true to select a folder instead of a file
      openLabel: "Select",
    };

    const folderUri = await vscode.window.showOpenDialog(options);
    if (folderUri && folderUri[0]) {
      const rootDir = folderUri[0].fsPath;
      console.log("Selected folder path:", rootDir);

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

      // FIXME: Update 29 - on into a function to be called from applicationBundle.ts
      const metadataPath = join(rootDir, "app.json");
      const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

      const srcDir = join(rootDir, "src");
      const allFiles = getAllFiles(srcDir, undefined);

      // The trailing / is included so that it is trimmed in removePrefix.
      // This produces "foo/bar.js" rather than "/foo/bar.js"
      const toTrim = srcDir + "/";

      const modules = allFiles.map(function (filePath: string) {
        return {
          name: removePrefix(filePath, toTrim),
          module: readFileSync(filePath, "utf-8"),
        };
      });

      const bundlePath = join(rootDir, "bundle.json");
      const appRegPath = join(rootDir, "set_js_app.json");
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
      writeFileSync(bundlePath, JSON.stringify(bundle));
      writeFileSync(appRegPath, JSON.stringify(appReg));
    }
  } catch (error) {
    console.error(error);
    throw new Error("Application Bundle Process Failed" + error);
  }
}
