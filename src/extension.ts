import { execSync } from "child_process";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension Activated");

  // TODO: troubleshoot installing dev container
  let installDevContainer = vscode.commands.registerCommand(
    "vscode-azure-managed-ccf.createCCFdevContainer",
    async function () {
      const template = await vscode.window.showQuickPick(
        [
          {
            label: "Standard CCF Template",
            description: "Create a CCF application from generic template.",
          },
          {
            label: "Custom",
            description:
              "Create a CCF application from a custom template (helpful for new MCCF users).",
          },
        ],

        { placeHolder: "Select a template for your CCF application" }
      );

      if (!template) return;
      else if (template.label === "Standard CCF Template") {
        // Opens the CCF App template in a dev container
        vscode.commands.executeCommand(
          "remote-containers.openRepositoryInUniqueVolume",
          "https://github.com/andpiccione/ccf-app-template"
        );
      }

      else if (template.label === "Custom") {
        // Create a CCF application from a custom template
        const templateOptions = [
          {
            label: "Audiable Logging App",
            description:
              "This is a sample application of logging app that takes advantage of CCF's ability for granular access control.",
            repository: "link to repo",
          },
          {
            label: "Banking App",
            description: "This is a sample application of a bank consortium.",
            repository: "https://github.com/andpiccione/ccf-sample-banking-app",
          },
          {
            label: "Data Reconciliation App",
            description:
              "This is the CCF Data Reconciliation - sample in TypeScript",
            repository: "link to repo",
          },
        ];

        const templateSelection = await vscode.window.showQuickPick(
          templateOptions,
          {
            placeHolder: "Select a template for your new CCF application",
            ignoreFocusOut: true,
            matchOnDescription: true,
          }
        );

        // eslint-disable-next-line curly
        if (!templateSelection) return;

        vscode.commands.executeCommand(
          "remote-containers.openRepositoryInUniqueVolume",
          templateSelection.repository
        );
      } // end of else if statement

      vscode.window.showInformationMessage("Environment Created");
    }
  );

  let startNetwork = vscode.commands.registerCommand(
    "vscode-azure-managed-ccf.startNetwork",
    async function () {
      // Run the ccf commands to start the network
      try {
        // Create terminal
        const terminal = vscode.window.createTerminal("Terminal");

        // Install Dependencies
        setTimeout(() => {
          terminal.sendText("npm --prefix . install");

          setTimeout(() => {
            // Build the JS app
            terminal.sendText("npm --prefix . run build");

            setTimeout(async () => {
              // Start app using sandbox script
              terminal.sendText(
                "/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./dist/"
              );
            }, 1000); 
          }, 1000); 
        }, 1000);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  );

  //https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/ccf-app-template
  context.subscriptions.push(installDevContainer);
  context.subscriptions.push(startNetwork);
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Extension Deactivated");
}