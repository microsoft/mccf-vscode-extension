// FIXME: Remember, each time we make an update to the below code and want to run the reflected updates, we will need to rebuild the .vsix and reinstall the extension in our dev container.
// _________________________________________________________________________________________________________________________________________________________________________________________

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

  let addUser = vscode.commands.registerCommand(
    "vscode-azure-managed-ccf.addUser",
    async function () {
      // TODO: Plan for this command:
      const memberName = await vscode.window.showInputBox({
        prompt: "Enter a name for the member",
        ignoreFocusOut: true,
      });

      const terminal2 = vscode.window.createTerminal("Terminal2");
      terminal2.sendText("keygenerator.sh --name " + memberName);

      // TODO: Activate the new member -- make sure to update name of ledger and member here
      terminal2.sendText("curl https://contoso.confidential-ledger.azure.com/gov/ack/update_state_digest -X POST --cacert service_cert.pem --keymember0_privk.pem --cert member0_cert.pem --silent| jq > request.json");
      terminal2.sendText('scurl.sh https://contoso.confidential-ledger.azure.com/gov/ack --cacert service_cert.pem--signing-key member0_privk.pem --signing-cert member0_cert.pem --header "Content-Type: application/json" --data-binary @request.json');
    
      /*
      To add new users, first use the keygenerator.sh --name 'name that you choose here' 
      This will createa public and private key pair for the users and the certificate
        a) Run this command:  user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

        b) Createa file set_user0.json file by right clicking in the dev container column. Put in the following info: 
        {
        "actions": [
            {
            "name": "set_user",
            "args": {
                "cert": "-----BEGIN CERTIFICATE-----\... n7c3AgKUrAxzq\n-----END CERTIFICATE-----\n"
                }
            }
            ]
        }
        c) create a vote_accept.json file and write in the following:
        {
        "ballot": "export function vote (proposal, proposerId) { return true }"
        }

        d) Now we propose the addition of the new user with the following command:
        > scurl.sh --url https://explorers1.confidential-ledger.azure.com/gov/proposals --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @set_user1.json -H "content-type: application/json"|jq -r '.proposal_id'`
        After running this command, we will see some stuff generated. pay attention to the characters within the
        (EXAMPLE... {"ballot_count":0,"proposal_id":"528387ec6a71bf27027d3263b2ab22e1e76a871552deb5138fd0d44248a148ea"...............)

        e) Copy and paste that long number after the proposal_id (no quotes) and paste it into the following command where the member accepts the user addition proposal:
        > scurl.sh https://explorers1.confidential-ledger.azure.com/gov/proposals/COPY AND PASTE RIGHT HERE!!!!/ballots --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @vote_accept.json -H "content-type: application/json"
      */

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

// code in progress:
/* 

              // won't run
               */

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
