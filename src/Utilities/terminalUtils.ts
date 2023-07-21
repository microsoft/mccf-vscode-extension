/* eslint-disable prettier/prettier */
import * as vscode from "vscode";

// Open a terminal and run command in it
export function runCommandInTerminal(terminalName: string, command: string) {
  // Create terminal
  const terminal = vscode.window.createTerminal({
    name: terminalName,
    isTransient: true,
  });

  // Show terminal
  terminal.show();

  // Run command
  terminal.sendText(command);
}
