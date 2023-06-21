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
            description: "Create an empty CCF application.",
          },
          {
            label: "Custom",
            description:
              "Create a CCF application from a custom template (helpful for new MCCF users).",
          },
        ],

        { placeHolder: "Select a template for your CCF application" }
      );

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

  // FIXME: Cannot access the ccf commands from the dev container opened by the extension command (ccf: Start Network)
  // FIXME: Can't be run/tested without environment set up & connected to environment
  // Issue: Cannot find command 'ccf' - this is because the ccf commands are not installed in the dev container
  // Solution: Install the ccf commands in the dev container
  // How to install the ccf commands in the dev container?
  // Install the ccf commands in the dev container using the extension command (ccf: Start Network) and the Dockerfile
  // how to do this:
  // 1. Create a Dockerfile that installs the ccf commands
  // 2. Create a Dockerfile that installs the ccf commands and runs the ccf commands

  let startNetwork = vscode.commands.registerCommand(
    "vscode-azure-managed-ccf.startNetwork",
    function () {
      // Run the ccf commands to start the network
      try {
        // Create terminal
		const terminal = vscode.window.createTerminal("Terminal");

		// Install Dependencies
		terminal.sendText("npm --prefix ./js run install");

		// Build the JS app
		terminal.sendText("npm --prefix ./js run build");

		// Start app using sandbox script
		terminal.sendText("/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./js/dist/");

		
      } catch (error) {
        //console.error("An error occurred:", error.message);
      }

      /*
		  // FIXME: Below's code outlines the steps to initialize a network with one node and one member. 
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
