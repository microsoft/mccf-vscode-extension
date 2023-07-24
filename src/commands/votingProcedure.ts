import * as vscode from "vscode";
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/terminalUtils";

export async function votingProcedure(specialContext: vscode.ExtensionContext) {
  // echo "usage: ./vote_proposal.sh --network-url string --signing-cert string --signing-key string --proposal-id string --vote-file string"

  // Prompt user to enter network url
  const networkUrl = await vscode.window.showInputBox({
    prompt: "Enter network url",
    placeHolder: "Network url",
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
    openLabel: "Select signing key (privk.pem file)",
    filters: { "Privk.pem files": ["pem"] },
  });

  // Check if signing key is undefined
  if (!signingKey) {
    vscode.window.showInformationMessage("No signing key selected");
    return;
  }

  // Prompt user to enter proposal id (for now have user input proposal id)
  const proposalId = await vscode.window.showInputBox({
    prompt: "Enter proposal id",
    placeHolder: "Proposal id",
  });

  // If no proposal id is entered, report it to the user
  if (!proposalId || proposalId.length === 0) {
    vscode.window.showInformationMessage("No proposal id entered");
    return;
  }

  // Prompt user to select the vote file via file explorer
  const voteFile = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: "Select voting file",
    filters: {
      "JSON files": ["json"],
    },
  });

  // Check if voting file is undefined
  if (!voteFile) {
    vscode.window.showInformationMessage("No voting file selected");
    return;
  }

  // Retrieve paths of sign cert, sign key, and voting file
  const signingCertPath = utilities.getPathOSAgnostic(signingCert[0].fsPath);
  const signingKeyPath = utilities.getPathOSAgnostic(signingKey[0].fsPath);
  const votingFilePath = utilities.getPathOSAgnostic(voteFile[0].fsPath);

  // Call the vote proposal function
  voteProposal(
    networkUrl,
    signingCertPath,
    signingKeyPath,
    proposalId,
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
