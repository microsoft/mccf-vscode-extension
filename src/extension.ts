import * as vscode from "vscode";
import { createDevContainerCommand } from "./commands/createDevContainer";
import { startCCFNetworkDevContainer } from "./commands/startCCFNetworkInDevContainer";
import { startCCFNetworkDocker } from "./commands/startCCFNetworkInDocker";
import { addMember } from "./commands/addMember";
import { submitProposal } from "./commands/submitProposal";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // COMMAND: Create CCF project in devcontainer
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.createCCFDevContainer",
      createDevContainerCommand,
    ),
  );

  // COMMAND: Start CCF network in devcontainer
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.startCCFNetworkDevContainer",
      startCCFNetworkDevContainer,
    ),
  );

  // COMMAND: Start CCF network in docker container
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.startCCFNetworkDocker",
      startCCFNetworkDocker,
    ),
  );

  // COMMAND: Add member
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-azure-managed-ccf.addMember", () =>
      addMember(context),
    ),
  );

  // COMMAND: Submit proposal
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-azure-managed-ccf.submitProposal", () =>
      submitProposal(context),
    ),
  );
}


// This method is called when your extension is deactivated
export function deactivate() {}
