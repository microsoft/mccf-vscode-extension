// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { execSync } from "child_process";
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
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

      // eslint-disable-next-line curly
      if (!template) return; // If the user didn't select a template, return
      else if (template.label === "Standard CCF Template") {
        // Opens the CCF App template in a dev container
        vscode.commands.executeCommand(
          "remote-containers.openRepositoryInUniqueVolume",
          "https://github.com/microsoft/ccf-app-template"
        );
      }

      //TODO: replace with the specific forked repos once they are ready. For now, all of these options will open the same repo: ccf-app-samples
      else if (template.label === "Custom") {
        // Create a CCF application from a custom template
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

        // eslint-disable-next-line curly
        if (!templateSelection) return;

        vscode.commands.executeCommand(
          "remote-containers.openRepositoryInUniqueVolume",
          "https://github.com/microsoft/ccf-app-samples"
        );
      } // end of else if statement

      // Display a message box to the user
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
            }, 1000); // 1 second delay before starting app
          }, 1000); // 1 second delay before building app
        }, 1000); // 1 second delay before installing dependencies
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

// code in progress:
/* // create a first member
              const terminal2 = vscode.window.createTerminal("Terminal2");
              const memberName = await vscode.window.showInputBox({
                prompt: "Enter a name for the first member",
                ignoreFocusOut: true,
              });

              // won't run
              terminal2.sendText("keygenerator.sh --name " + memberName); */

/*
            //FIXME: the below commands won't execute
             // Start up a new terminal for network activation
            const networkActivation =
              vscode.window.createTerminal("Net. Activation");

            // TODO: Retrieve the ccf-node-address from the user
            // TODO: Set up a condition for multiple members (3 minimum?)

            networkActivation.sendText(
              "curl https://localhost/gov/ack/update_state_digest -X POST --cacert service_cert.pem --key new_member_privk.pem --cert new_member_cert.pem --silent | jq > request.json"
            ); // Activate Member

            networkActivation.sendText("cat request.json");

            networkActivation.sendText(
              'curl.sh https://localhost/gov/ack --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --header "Content-Type: application/json" --data-binary @request.json'
            ); // Send Acknowledgement */

/*
      // FIXME: Below's code outlines the steps to completing network governance 
      // Update and retrieve the latest state digest
      const updateStateDigestEndpoint = "https://<ccf-node-address>/gov/ack/update_state_digest";
      const updateStateDigestCommand = `curl ${updateStateDigestEndpoint} -X POST --cacert service_cert.pem --key new_member_privk.pem --cert new_member_cert.pem --silent | jq > request.json`;
      execSync(updateStateDigestCommand);
	
      // Read the state digest from the request.json file
      const requestJson = fs.readFileSync('request.json', 'utf8');
      const stateDigest = JSON.parse(requestJson).state_digest;
	
      // Sign the state digest and send the acknowledgment
      const ackEndpoint = "https://<ccf-node-address>/gov/ack";
      const ackCommand = `ccf_cose_sign1 --ccf-gov-msg-type ack --ccf-gov-msg-created_at "$(date -Is)" --signing-key new_member_privk.pem --signing-cert new_member_cert.pem --content request.json | curl ${ackEndpoint} --cacert service_cert.pem --data-binary @- -H "content-type: application/cose"`;
      execSync(ackCommand);
	
      // Verify the activation of the member
      const membersEndpoint = "https://<ccf-node-address>/gov/members";
      const membersResponse = axios.get(membersEndpoint);
      const membersData = membersResponse.data;
      console.log(membersData);
    */
