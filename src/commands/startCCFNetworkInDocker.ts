import * as vscode from "vscode";

// Build and run a CCF network inside a docker container
export async function startCCFNetworkDocker() {
  try {
    // Get the dockerfile for building the container
    const dockerfileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select Dockerfile",
      title: "Select Dockerfile",
    });

    // If no file is selected, report it to the user
    if (!dockerfileUri || dockerfileUri.length === 0) {
      vscode.window.showInformationMessage("No file selected");
      return;
    }

    // Get the path of the file
    const dockerfilePath = dockerfileUri[0].fsPath;

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

    const imageName = "ccf-app:virtual";

    // Build and run a docker container
    const dockerBuildCommand =
      "docker build -t " +
      imageName +
      " -f " +
      dockerfilePath +
      " " +
      folderPath;
    const dockerRunCommand = "docker run -it --rm -p 8000:8000 " + imageName;

    // Create a sequence of commands to run in the terminal
    // such that we will execute the subsequent commands only if the previous ones succeed
    const commandsSequence = [dockerBuildCommand, dockerRunCommand];

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