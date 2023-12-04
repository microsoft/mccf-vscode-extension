import * as vscode from "vscode";
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/extensionUtils";
import { execSync } from "child_process";
import { logAndDisplayError, logAndThrowError } from "../Utilities/errorUtils";
import path = require("path");

const voteQuickPickItems: vscode.QuickPickItem[] = [
  {
    label: "Accept",
  },
  {
    label: "Reject",
  },
  {
    label: "Custom",
  },
];

export async function voteProposal(specialContext: vscode.ExtensionContext) {
  try {
    // Prompt user to enter network url
    const networkUrl = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter the CCF network URL",
      placeHolder: "https://example.confidential-ledger.azure.com",
      value: "https://127.0.0.1:8000",
    });

    // If no network url is entered, report it to the user
    if (!networkUrl || networkUrl.length === 0) {
      vscode.window.showErrorMessage("No network url entered");
      return;
    }

    // Prompt user to select an active proposal
    const proposalId = await getProposal(networkUrl);

    // If no proposal id is selected, report it to the user
    if (!proposalId || proposalId.length === 0) {
      vscode.window.showErrorMessage("No proposal selected");
      return;
    }

    // Prompt user to cast a vote
    const vote = await castVote(specialContext);

    // If no vote is selected, report it to the user
    if (!vote || vote.length === 0) {
      vscode.window.showErrorMessage("No vote selected");
      return;
    }

    // Prompt user to enter signing cert via file explorer
    const signingCert = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select signing certificate",
      title: "Select signing certificate",
      filters: { "PEM files": ["pem"] },
    });

    // Check if signing cert is undefined
    if (!signingCert) {
      vscode.window.showErrorMessage("No signing cert selected");
      return;
    }

    // Prompt user to enter signing key via file explorer
    const signingKey = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select signing key",
      title: "Select signing key",
      filters: { "PEM files": ["pem"] },
    });

    // Check if signing key is undefined
    if (!signingKey) {
      vscode.window.showErrorMessage("No signing key selected");
      return;
    }

    // Retrieve paths of sign cert, sign key, and voting file
    const signingCertPath = utilities.getPathOSAgnostic(signingCert[0].fsPath);
    const signingKeyPath = utilities.getPathOSAgnostic(signingKey[0].fsPath);
    const votingFilePath = utilities.getPathOSAgnostic(vote);

    // Call the vote proposal function
    voteForProposal(
      networkUrl,
      signingCertPath,
      signingKeyPath,
      proposalId,
      votingFilePath,
      specialContext.extensionPath,
    );

    // Display message to the user
    vscode.window.showInformationMessage("Vote submission in progress");
  } catch (error: any) {
    logAndDisplayError("Error when voting for a proposal", error);
  }
}

// Function that runs the vote_proposal.sh script to vote on a proposal
function voteForProposal(
  networkUrl: string,
  signingCert: string,
  signingKey: string,
  proposalId: string,
  voteFile: string,
  extensionPath: string,
) {
  try {
    const command = `cd ${extensionPath}/dist/scripts; ${utilities.getBashCommand()} ./vote_proposal.sh --network-url ${networkUrl} --signing-cert ${signingCert} --signing-key ${signingKey} --proposal-id ${proposalId} --vote-file ${voteFile}`;
    runCommandInTerminal("Proposal Voting", command);
  } catch (error: any) {
    logAndThrowError("Error when submitting the vote", error);
  }
}

async function getProposal(networkUrl: string): Promise<string> {
  try {
    const command =
      `${utilities.getWsl()}` + `curl ${networkUrl}/gov/kv/proposals -k`;

    // Run the command and store the output
    let proposals = execSync(command).toString();

    // Assuming 'proposals' is in JSON format and parse in to an object
    const jsonResponse = JSON.parse(proposals);

    // save all the proposal id to an array
    const proposalArray: string[] = [];
    for (const key in jsonResponse) {
      if (Object.prototype.hasOwnProperty.call(jsonResponse, key)) {
        proposalArray.push(key);
      }
    }

    if (proposalArray.length === 0) {
      throw new Error("No active proposals found");
    }

    const selectedProposal = await vscode.window.showQuickPick(proposalArray, {
      ignoreFocusOut: true,
      placeHolder: "Select a proposal",
    });

    // Check if no proposal was selected
    if (!selectedProposal) {
      throw new Error("No proposal selected");
    }

    // Return the proposal id of the selected proposal
    return selectedProposal ?? "";
  } catch (error: unknown) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(error.message);
    }
    return "";
  }
}

// Function that retrieves the appropriate voting file
export async function castVote(
  extContext: vscode.ExtensionContext,
): Promise<string> {
  // Display a quick pick menu with vote accept or vote reject options
  const selectedVote = await vscode.window.showQuickPick(voteQuickPickItems, {
    ignoreFocusOut: true,
    placeHolder: "Select a vote",
  });

  // Check if no vote was selected
  if (!selectedVote) {
    return "";
  }

  // Return the appropriate voting file
  if (selectedVote.label === "Accept") {
    // return path of accept vote file
    return path.join(extContext.extensionPath, "dist/votes/vote_accept.json");
  } else if (selectedVote.label === "Reject") {
    // return path of reject vote file
    return path.join(extContext.extensionPath, "dist/votes/vote_reject.json");
  } else {
    // Prompt user to enter custom voting file via file explorer
    const customVote = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Select custom voting file",
      title: "Select custom voting file",
      filters: { "JSON files": ["json"] },
    });

    // Return the path of the custom voting file
    return customVote ? customVote[0].fsPath : "";
  }
}
