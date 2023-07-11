import * as vscode from "vscode";
import { openRepositoryInDevContainerCommand } from "./constants";

// Options for the CCF application templates
const standardTemplateOption = {
  label: "Standard CCF Template",
  description: "Create a CCF application from generic template",
  repository: "https://github.com/andpiccione/ccf-app-template",
};

const sampleBankingAppOption = {
  label: "Sample Banking App",
  description: "Create a sample CCF application from a banking app template",
  repository: "https://github.com/andpiccione/ccf-sample-banking-app",
};

const customProjectOption = {
  label: "Custom project",
  description: "Create a CCF application from a custom URL",
};

// Create a devcontainer from a CCF application template
export async function createDevContainerCommand() {
  try {
    const templateOptions = [
      standardTemplateOption,
      sampleBankingAppOption,
      customProjectOption,
    ];

    const template = await vscode.window.showQuickPick(templateOptions, {
      placeHolder: "Select a template for your CCF application",
    });

    if (!template) {
      vscode.window.showInformationMessage("No template was selected");
      return;
    }

    // Create a devcontainer from the ccf app template
    if (template.label === standardTemplateOption.label) {
      console.log("Creating dev container for " + standardTemplateOption.label);

      // Opens the dev container with the corresponding repository
      vscode.commands.executeCommand(
        openRepositoryInDevContainerCommand,
        standardTemplateOption.repository,
      );
    }

    // Create a devcontainer from the sample banking app
    else if (template.label === sampleBankingAppOption.label) {
      // Create a CCF application from a banking app template
      console.log("Creating dev container for " + sampleBankingAppOption.label);

      // Opens the dev container with the corresponding repository
      vscode.commands.executeCommand(
        openRepositoryInDevContainerCommand,
        sampleBankingAppOption.repository,
      );
    } else if (template.label === customProjectOption.label) {
      // Get the repository URL
      const repositoryUrl = await vscode.window.showInputBox({
        prompt: "Enter the repository URL",
        placeHolder: "https://github.com/username/repo.git",
        ignoreFocusOut: true,
      });

      if (!repositoryUrl) {
        vscode.window.showInformationMessage("No repository URL entered");
        return;
      }

      // Create the devcontainer with the input URL
      vscode.commands.executeCommand(
        openRepositoryInDevContainerCommand,
        repositoryUrl,
      );
    }
  } catch (error) {
    console.error("CCF project could not be created", error);
    vscode.window.showErrorMessage("CCF project creation failed");
  }

  vscode.window.showInformationMessage("CCF Project successfully initialized");
}
