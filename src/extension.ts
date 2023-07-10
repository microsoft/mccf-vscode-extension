import * as vscode from "vscode";
import { createDevContainerCommand } from "./commands/createDevContainer";
import { startCCFNetworkDevContainer } from "./commands/startCCFNetworkInDevContainer";
import { startCCFNetworkDocker } from "./commands/startCCFNetworkInDocker";
import { exec, execSync } from 'child_process';
import { submitProposal } from "./commands/submitProposal";
import * as path from "path";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("Extension Activated");
  
  // COMMAND: Create CCF project in devcontainer
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.createCCFDevContainer",
      createDevContainerCommand
    )
  );

  // COMMAND: Start CCF network in devcontainer
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.startCCFNetworkDevContainer",
      startCCFNetworkDevContainer
    )
  );

  // COMMAND: Start CCF network in docker container
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.startCCFNetworkDocker",
      startCCFNetworkDocker
    )
  );

  // COMMAND: Runs and submits a proposal
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.submitProposal",
      () => {

        submitProposal(context);

      }
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Extension Deactivated");
}
