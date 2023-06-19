// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { execSync, exec, spawnSync } = require("child_process");
const { spawn } = require("child_process");
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

      let selectedTemplate; // Define the selectedTemplate variable
      if (!template) return; // If the user didn't select a template, return

      if (template.label === "Empty") {
        // Opens the CCF App template in a dev container

        const link =
          "vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/ccf-app-template";

        vscode.env.openExternal(vscode.Uri.parse(link));

        vscode.window.showInformationMessage("Environment Created");
      } else if (template.label === "Custom") {
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

  // Command to create CCF App
  let create_new_ccf_application_javascript = vscode.commands.registerCommand(
    "mccf-vscode-extension.javascriptapp",
    async function () {
      // used async becuase ome operations in the function, such as showing input boxes and performing git cloning, may involve asynchronous operations that return things
      // The code you place here will be executed every time your command is executed
      // prompt the user first with two options -- Empty Template vs. Custom Template
      const template = await vscode.window.showQuickPick(
        [
          { label: "Empty", description: "Create an empty CCF application." },
          {
            label: "Custom",
            description: "Create a CCF application from a custom template.",
          },
        ],

        { placeHolder: "Select a template for your CCF application" }
      );

      let selectedTemplate; // Define the selectedTemplate variable
      if (!template) return;

      if (template.label === "Empty") {
        // Create an empty CCF application
        // Replace this section with your logic to generate the required files and dependencies for an empty application
        execSync(`git clone https://github.com/microsoft/ccf-app-template`);
        vscode.window.showInformationMessage(`Environment Created`);
      } else if (template.label === "Custom") {
        // Create QuickPick menu to choose custom template
        const templateOptions = [
          {
            label: "Audiable Logging App",
            description:
              "This is a sample application of logging app that takes advantage of CCFs ability for granular access control.",
            repository:
              "https://github.com/microsoft/ccf-app-samples.git/auditable-logging-app",
          },
          {
            label: "Banking App",
            description: "This is a sample application of a bank consortium.",
            repository:
              "https://github.com/microsoft/ccf-app-samples.git/banking-app",
          },
          {
            label: "Data Reconciliation App",
            description:
              "This is the CCF Data Reconciliation - sample in typescript",
            repository:
              "https://github.com/microsoft/ccf-app-samples.git/data-reconciliation-app",
          },
        ];

        // Show QuickPick menu to choose custom template
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

        // TODO: Handle the cloning logic for the selected template's repository
        // You can use the git command-line tool or a Git client library to clone the repository
        execSync(`git clone ${selectedTemplate}`);

        // Replace the following line with your logic to handle the cloned repository and perform any additional setup
        vscode.window.showInformationMessage(
          `Selected custom template: ${selectedTemplate}, App name: ${appName}`
        );
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

  let start_ccf_network = vscode.commands.registerCommand(mccf-vscode-extension.startccfnetwork, function () {
    // Run the ccf command to start the network

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

    // question: what about the curl commands? how do we run them?
    /*
    $ curl -X POST https://127.0.0.1:8000/app/log?id=1 --cacert ./workspace/sandbox_common/service_cert.pem -H "Content-Type: application/json" --data '{"msg": "hello world"}'
    $ curl https://127.0.0.1:8000/app/log?id=1 --cacert ./workspace/sandbox_common/service_cert.pem 
    */

  });
  //https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/ccf-app-template
  context.subscriptions.push(disposable);
  context.subscriptions.push(install_dev_container);
  context.subscriptions.push(create_new_ccf_application_javascript);
  context.subscriptions.push(create_new_ccf_application_cplus);
}

// This method is called when your extension is deactivated
function deactivate() {
  console.log("MCCF extension is now deactivated.");
}

module.exports = {
  activate,
  deactivate,
};
