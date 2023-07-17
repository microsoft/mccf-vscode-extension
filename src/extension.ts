import * as vscode from "vscode";
import { createDevContainerCommand } from "./commands/createDevContainer";
import { startCCFNetworkDevContainer } from "./commands/startCCFNetworkInDevContainer";
import { startCCFNetworkDocker } from "./commands/startCCFNetworkInDocker";
import { createMCCFInstance } from "./commands/mccfDeployment";
import { listMCCFInstances } from "./commands/listMCCFInstance";
import { addMember } from "./commands/addMember";
import { submitProposal } from "./commands/submitProposal";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("Extension Activated");

  // COMMAND: Create CCF project in devcontainer
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.createCCFDevContainer",
      () => createDevContainerCommand(context),
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

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.mccfDeployment",
      createMCCFInstance,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.listMccfDeployment",
      listMCCFInstances,
    ),
  );

  // COMMAND: Submit proposal
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-azure-managed-ccf.submitProposal",
      () => submitProposal(context),
    ),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Extension Deactivated");
}
