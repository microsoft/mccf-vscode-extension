// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
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
        vscode.commands.executeCommand(
          "remote-containers.openRepositoryInUniqueVolume",
          "https://github.com/microsoft/ccf-app-template"
        );
      }

      else if (template.label === "Custom") {
        const templateOptions = [
          {
            label: "Audiable Logging App",
            description:
              "This is a sample application of logging app that takes advantage of CCF's ability for granular access control.",
          },
          {
            label: "Banking App",
            description: "This is a sample application of a bank consortium.",
          },
          {
            label: "Data Reconciliation App",
            description:
              "This is the CCF Data Reconciliation - sample in TypeScript",
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

        if (!templateSelection) return;

        vscode.commands.executeCommand(
          "remote-containers.openRepositoryInUniqueVolume",
          "https://github.com/microsoft/ccf-app-samples"
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
          terminal.sendText("npm --prefix ./js install");

          setTimeout(() => {
            // Build the JS app
            terminal.sendText("npm --prefix ./js run build");

            setTimeout(async () => {
              // Start app using sandbox script
              terminal.sendText(
                "/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./js/dist/"
              );
            }, 1000);
          }, 1000); 
        }, 1000); 
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  );

  let addUser = vscode.commands.registerCommand(
    "vscode-azure-managed-ccf.addUser",
    async function () {
      const memberName = await vscode.window.showInputBox({
        prompt: "Enter a name for the member",
        ignoreFocusOut: true,
      });

      const terminal2 = vscode.window.createTerminal("Terminal2");
      terminal2.sendText("keygenerator.sh --name " + memberName);

      // TODO: Activate the new member -- make sure to update name of ledger and member here
      terminal2.sendText("curl https://contoso.confidential-ledger.azure.com/gov/ack/update_state_digest -X POST --cacert service_cert.pem --keymember0_privk.pem --cert member0_cert.pem --silent| jq > request.json");
      terminal2.sendText('scurl.sh https://contoso.confidential-ledger.azure.com/gov/ack --cacert service_cert.pem--signing-key member0_privk.pem --signing-cert member0_cert.pem --header "Content-Type: application/json" --data-binary @request.json');
    
    }); // End of addUser

  //https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/ccf-app-template
  context.subscriptions.push(installDevContainer);
  context.subscriptions.push(startNetwork);
  context.subscriptions.push(addUser);
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Extension Deactivated");
}

