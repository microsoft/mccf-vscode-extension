/* eslint-disable prettier/prettier */
import * as vscode from "vscode";

export function runCommandInTerminal(terminalName: string, command: string) {
  // Create terminal if it doesn't already exist with the inputted terminalName:
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
