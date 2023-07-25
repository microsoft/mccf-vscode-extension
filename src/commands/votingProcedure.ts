import * as vscode from "vscode";
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/terminalUtils";
import * as fs from "fs";
import { execSync } from "child_process";

export async function votingProcedure(specialContext: vscode.ExtensionContext) {
  // Prompt user to enter network url
  const networkUrl = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    prompt: "Enter the CCF network URL",
    placeHolder: "https://example.confidential-ledger.azure.com",
  });

  // If no network url is entered, report it to the user
  if (!networkUrl || networkUrl.length === 0) {
    vscode.window.showInformationMessage("No network url entered");
    return;
  }

  // Prompt user to enter signing cert via file explorer
  const signingCert = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: "Select signing certificate",
    filters: { "Cert.pem files": ["pem"] },
  });

  // Check if signing cert is undefined
  if (!signingCert) {
    vscode.window.showInformationMessage("No signing cert selected");
    return;
  }

  // Prompt user to enter signing key via file explorer
  const signingKey = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: "Select signing key",
    filters: { "Privk.pem files": ["pem"] },
  });

  // Check if signing key is undefined
  if (!signingKey) {
    vscode.window.showInformationMessage("No signing key selected");
    return;
  }

  // Prompt user to enter proposal id
  const proposalId = displayProposals(networkUrl);

  // If no proposal id is entered, report it to the user
  if (!proposalId) {
    vscode.window.showInformationMessage("No proposal id entered");
    return;
  }

  // Retrieve paths of sign cert, sign key, and voting file
  const signingCertPath = utilities.getPathOSAgnostic(signingCert[0].fsPath);
  const signingKeyPath = utilities.getPathOSAgnostic(signingKey[0].fsPath);
  const votingFilePath = utilities.getPathOSAgnostic(
    specialContext.extensionPath + "/dist/vote.json",
  );

  // Call the vote proposal function
  voteProposal(
    networkUrl,
    signingCertPath,
    signingKeyPath,
    await proposalId,
    votingFilePath,
    specialContext.extensionPath,
  );
}

// Function that runs the vote_proposal.sh script to vote on a proposal
async function voteProposal(
  networkUrl: string,
  signingCert: string,
  signingKey: string,
  proposalId: string,
  voteFile: string,
  extensionPath: string,
) {
  try {
    const command = `cd ${extensionPath}/dist; ${utilities.getBashCommand()} ./vote_proposal.sh --network-url ${networkUrl} --signing-cert ${signingCert} --signing-key ${signingKey} --proposal-id ${proposalId} --vote-file ${voteFile}`;
    runCommandInTerminal("Proposal Voting", command);
  } catch (error: unknown) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(error.message);
    }
  }
}

async function displayProposals(networkUrl: string): Promise<string> {
  try {
    const command = `${utilities.getWsl()} curl ${networkUrl}/gov/proposals -k`;

    // Run the command and store the output
    let proposals = execSync(command).toString();

    if (proposals.length === 0) {
      vscode.window.showInformationMessage("No active proposals found");
      return "";
    }

    // remove the first and last character of the output
    proposals = proposals.slice(1, -1);

    const regex = /(".{64}":{.*?})(?=,".{64}":|\s*$)/g;
    const proposalArray = proposals.match(regex);

    console.log(proposalArray);

    // Create a quick pick item for each proposal only displaying the proposal id
    const proposalQuickPickItems: vscode.QuickPickItem[] = [];
    proposalArray?.forEach((proposal) => {
      const proposalId = proposal.slice(1, 65);
      proposalQuickPickItems.push({
        label: proposalId,
      });
    });

    const selectedProposal = await vscode.window.showQuickPick(
      proposalQuickPickItems,
      {
        ignoreFocusOut: true,
        placeHolder: "Select a proposal ID to vote on",
      },
    );

    // Show the proposal id of the selected proposal in message window
    vscode.window.showInformationMessage(
      `Selected proposal id: ${selectedProposal?.label}`,
    );

    // Return the proposal id of the selected proposal
    return selectedProposal?.label ?? "";
  } catch (error: unknown) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(error.message);
    }
    return "";
  }
}
