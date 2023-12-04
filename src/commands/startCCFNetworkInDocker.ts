import * as vscode from "vscode";
import { runCommandInTerminal } from "../Utilities/extensionUtils";
import { logAndDisplayError } from "../Utilities/errorUtils";

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
      vscode.window.showErrorMessage("No docker file selected");
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
      vscode.window.showErrorMessage("No application folder selected");
      return;
    }

    // Get the path of the folder
    
    const folderPath = appFolderUri[0].fsPath;

    const imageName = "ccf-app:virtual";

    // Build and run a docker container
    const dockerBuildCommand =
      "DOCKER_BUILDKIT=1 docker build -t " +
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

    // Run the command in the terminal
    runCommandInTerminal("Start CCF Network Terminal", finalCommand);
  } catch (error: any) {
    logAndDisplayError("CCF network could not be started", error);
  }
}
