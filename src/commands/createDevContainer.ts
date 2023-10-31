import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as constants from "./constants";
import * as folderUtils from "../Utilities/folderUtils";
import { logAndDisplayError, logAndThrowError } from "../Utilities/errorUtils";

// Options for the CCF application templates

const emptyAppOption = {
  label: "Empty App Template",
  description: "Create a CCF project from an empty template",
  sourceFolder: "empty-app",
};

const sampleBasicAppOption = {
  label: "Sample Basic App",
  description: "Create a CCF project from a basic CCF application",
  sourceFolder: "basic-app",
};

const sampleBankingAppOption = {
  label: "Sample Banking App",
  description: "Create a CCF project from a sample banking application",
  sourceFolder: "banking-app",
};

const sampleLoggingAppOption = {
  label: "Sample Logging App",
  description: "Create a CCF project from a sample logging application",
  sourceFolder: "logging-app",
};

const sampleDataReconciliationAppOption = {
  label: "Sample Data Reconciliation App",
  description:
    "Create a CCF project from a sample data reconciliation application",
  sourceFolder: "data-reconciliation-app",
};

// Create a devcontainer from a CCF application template
export async function createDevContainerCommand(
  context: vscode.ExtensionContext,
) {
  try {
    const templateOptions = [
      emptyAppOption,
      sampleBasicAppOption,
      sampleBankingAppOption,
      sampleLoggingAppOption,
      sampleDataReconciliationAppOption,
    ];

    const template = await vscode.window.showQuickPick(templateOptions, {
      title: "Select a template for your CCF application",
      ignoreFocusOut: true,
    });

    if (!template) {
      vscode.window.showInformationMessage("No template was selected");
      return;
    }

    // Get the destination folder where to store the template
    const appFolderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select destination folder",
      title: "Select destination folder",
    });

    // If no folder is selected, report it to the user
    if (!appFolderUri || appFolderUri.length === 0) {
      vscode.window.showInformationMessage("No folder selected");
      return;
    }

    // Get the path of the folder
    const folderPath = appFolderUri[0].fsPath;

    // Get the name of the folder where to store the template
    const folderName = await vscode.window.showInputBox({
      prompt: "Enter the new folder name",
      placeHolder: "mccf-project",
      ignoreFocusOut: true,
    });

    // If no name is given, report it to the user
    if (!folderName || folderName.length === 0) {
      vscode.window.showInformationMessage("No folder name entered");
      return;
    }

    // Create new project folder with the given parameters
    const newFolderPath = path.join(folderPath, folderName);

    // If the folder already exists, report it to the user
    if (fs.existsSync(newFolderPath)) {
      vscode.window.showErrorMessage(
        "Folder already exists. Please choose a different name",
      );
      return;
    }

    try {
      folderUtils.createFolder(newFolderPath);

      // Get path to the extension
      const extensionPath = context.extensionPath;

      // Get path to the templates folder
      const templatePath = path.join(extensionPath, "dist", "templates");

      // Create a devcontainer from one of the provided templates
      console.log("Creating dev container for template " + template.label);

      // Create template and start devcontainer
      initializeProjectFolder(
        templatePath,
        template.sourceFolder,
        newFolderPath,
      );
    } catch (error: any) {
      // Delete the folder and any file created upon exception
      fs.rmSync(newFolderPath, { force: true, recursive: true });
      logAndThrowError(
        "Error initializing template folder in devcontainer",
        error,
      );
    }

    vscode.window.showInformationMessage(
      "CCF Project successfully initialized",
    );
  } catch (error: any) {
    logAndDisplayError("CCF project could not be created", error);
  }
}
function initializeProjectFolder(
  templatePath: string,
  appPath: string,
  destPath: string,
) {
  // Copy the shared template files into the destination folder
  folderUtils.copyDirectoryRecursiveSync(
    path.join(templatePath, "shared-template"),
    destPath,
  );

  // Copy the files specific to the application into the destination folder
  folderUtils.copyDirectoryRecursiveSync(
    path.join(templatePath, appPath),
    destPath,
    true, // overwrite files copied from the template if they already exist in the destination folder
  );

  // Set proper permissions for the destination folder
  folderUtils.setPermissionsRecursively(destPath, 0o755);

  // Convert line endings to LF
  folderUtils.convertLineEndingsRecursive(destPath);

  // Opens the folder in a new window. It does not automatically open a devcontainer
  // as this is currently not supported by the remote containers API (see https://github.com/microsoft/vscode-remote-release/issues/8422).
  // Still, the user will be prompted with a dialog to open the folder in a devcontainer after the new window is opened.
  vscode.commands.executeCommand(
    constants.openFolderInDevContainerCommand,
    vscode.Uri.file(destPath),
  );
}
