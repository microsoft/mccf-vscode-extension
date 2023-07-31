import * as vscode from "vscode";
import { ProgressLocation, window } from "vscode";
import { logAndThrowError } from "./errorUtils";

// Open a terminal and run command in it
export function runCommandInTerminal(terminalName: string, command: string) {
  // Create terminal
  const terminal =
    vscode.window.terminals.find((t) => t.name === terminalName) ||
    vscode.window.createTerminal({
      name: terminalName,
      isTransient: true,
    });

  // Show terminal
  terminal.show();

  // Run command
  terminal.sendText(command);
}

// Show output in output channel
export function showOutputInChannel(channelName: string, output: string) {
  // Create output channel
  const outputChannel = vscode.window.createOutputChannel(channelName);

  // Show output channel
  outputChannel.show();

  // Append output to output channel
  outputChannel.appendLine(output);
}

// Open a progress bar and execute a task
export async function withProgressBar<T>(
  title: string,
  cancellable: boolean,
  task: () => Promise<T>,
) {
  try {
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: title,
        cancellable: cancellable,
      },
      async () => {
        await task();
      },
    );
  } catch (error: any) {
    logAndThrowError("Failed to execute task", error);
  }
}
