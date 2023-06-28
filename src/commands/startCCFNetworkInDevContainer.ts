import * as vscode from "vscode";

// Build and start a CCF network inside the devcontainer
export async function startCCFNetworkDevContainer() {
  try {
    // Get the folder where the app is located
    const appFolderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select project folder",
      title: "Select project folder",
    });

    // If no folder is selected, report it to the user
    if (!appFolderUri || appFolderUri.length === 0) {
      vscode.window.showInformationMessage("No folder selected");
      return;
    }

    // Get the path of the folder
    const folderPath = appFolderUri[0].fsPath;

    // Build and start the CCF network commands inside devcontainer
    const installCommand = "npm --prefix " + folderPath + " install";
    const buildCommand = "npm --prefix " + folderPath + " run build";
    const startCommand =
      "/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle " +
      folderPath +
      "/dist/";

    // Create a sequence of commands to run in the terminal
    // such that we will execute the subsequent commands only if the previous ones succeed
    const commandsSequence = [installCommand, buildCommand, startCommand];

    const finalCommand = commandsSequence.join(" && ");

    // Create terminal
    const terminal = vscode.window.createTerminal({
      name: "Start CCF Network Terminal",
      isTransient: true,
    });

    // Show terminal
    terminal.show();

    // Run command
    terminal.sendText(finalCommand);
  } catch (error) {
    console.error("CCF network could not be started", error);
    vscode.window.showErrorMessage("CCF network failed to start");
  }
}
