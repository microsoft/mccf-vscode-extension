// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { execSync } = require("child_process");
const rimraf = require("rimraf");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "mccf-vscode-extension" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "mccf-vscode-extension.helloWorld",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello World from mccf-vscode-extension!"
      );
    }
  );

  // TODO: troubleshoot installing dev container

  let install_dev_container = vscode.commands.registerCommand(
    "mccf-vscode-extension.install",
    async function () {
      const template = await vscode.window.showQuickPick(
        [
          { label: "Empty", description: "Create an empty CCF application." },
          {
            label: "Custom",
            description:
              "Create a CCF application from a custom template (Recommended for new/first-time users).",
          },
        ],

        { placeHolder: "Select a template for your CCF application" }
      );

      if (!template) return; // If the user didn't select a template, return

      if (template.label === "Empty") {
        // Opens the CCF App template in a dev container
        vscode.commands.executeCommand('remote-containers.openRepositoryInUniqueVolume', 'https://github.com/microsoft/ccf-app-template');

        vscode.window.showInformationMessage("Environment Created");
      } 

      //FIXME: This is not working
      else if (template.label === "Custom") {
        // Create a CCF application from a custom template
        const templateOptions = [
          {
            label: "Audiable Logging App",
            description:
              "This is a sample application of logging app that takes advantage of CCF's ability for granular access control.",
            repository:
              "https://github.com/microsoft/ccf-app-samples/auditable-logging-app",
          },
          {
            label: "Banking App",
            description: "This is a sample application of a bank consortium.",
            repository:
              "https://github.com/microsoft/ccf-app-samples/banking-app",
          },
          {
            label: "Data Reconciliation App",
            description:
              "This is the CCF Data Reconciliation - sample in TypeScript",
            repository:
              "https://github.com/microsoft/ccf-app-samples/data-reconciliation-app",
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
        
        const selectedTemplate = templateSelection.repository;
        
        // download the files individually contained within that repository that is selected
        // do this within the dev container
        // we want only the folder -- manually download the files. use the url to download the files and then access specific folder

        const link =
          "vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=" + selectedTemplate;

        vscode.env.openExternal(vscode.Uri.parse(link));
        
        } // end of else if statement

      /* WORKING CODE  
      // The code you place here will be executed every time your command is executed
      const repoDirectory = "ccf-app-template";

      try {
        // Remove the existing repository directory
        rimraf.sync(repoDirectory);

        // Clone the repository
        execSync("git clone https://github.com/microsoft/ccf-app-template");

        // Change directory to the cloned repository
        process.chdir(repoDirectory);

        // Open the repository in a dev container
        execSync("code .");

      } catch (error) {
        console.error("An error occurred:", error.message);
      } */

      // Display a message box to the user
      vscode.window.showInformationMessage("Installed Dev Environment!");
    }
  );

  // Command to create CCF JavaScript App
  let create_new_ccf_application_javascript = vscode.commands.registerCommand(
    "mccf-vscode-extension.javascriptapp",
    async function () {
     // The code you place here will be executed every time your command is executed
     const repoDirectory = "ccf-app-template";

     try {
       // Remove the existing repository directory
       rimraf.sync(repoDirectory);

       // Clone the repository
       execSync("git clone https://github.com/microsoft/ccf-app-template");

       // Change directory to the cloned repository
       process.chdir(repoDirectory);

       // Open the repository in a dev container
       execSync("code .");

     } catch (error) {
       console.error("An error occurred:", error.message);
     }
    }
  );

  let create_new_ccf_application_cplus = vscode.commands.registerCommand(
    "mccf-vscode-extension.cplusplusapp",
    function () {
      // The code you place here will be executed every time your command is executed
      //console.log('Installing Javascript App Template...');
      // execSync('npm --prefix ./js install');

      vscode.window.showInformationMessage("C++ App Template Installed!");
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
 
  let start_ccf_network = vscode.commands.registerCommand("mccf-vscode-extension.startNetwork", function () {
    // Run the ccf commands to start the network
    try {
      // Install dependencies
      execSync('npm --prefix ./js install');
  
      // Build the JavaScript app
      execSync('npm --prefix ./js run build');
  
      // Start the app using the sandbox script
      execSync('/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./js/dist/');
      
      console.log('Commands executed successfully!');
    } catch (error) {
      console.error('An error occurred:', error.message);
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

  });
  //https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/ccf-app-template
  context.subscriptions.push(disposable);
  context.subscriptions.push(install_dev_container);
  context.subscriptions.push(create_new_ccf_application_javascript);
  context.subscriptions.push(create_new_ccf_application_cplus);
  context.subscriptions.push(start_ccf_network);
}

// This method is called when your extension is deactivated
function deactivate() {
  console.log("MCCF extension is now deactivated.");
}

module.exports = {
  activate,
  deactivate,
};
