import * as vscode from "vscode";
import * as utilities from "../Utilities/osUtilities";
import { runCommandInTerminal } from "../Utilities/extensionUtils";
import { execSync } from "child_process";

export async function voteProposal(specialContext: vscode.ExtensionContext) {
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

  // Prompt user to select an active proposal
  const proposalId = await sendBallot(networkUrl);

  // If no proposal id is selected, report it to the user
  if (!proposalId || proposalId.length === 0) {
    return;
  }

  // Prompt user to cast a vote
  const vote = await castVote();

  // If no vote is selected, report it to the user
  if (!vote || vote.length === 0) {
    vscode.window.showInformationMessage("No vote selected");
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

  // Retrieve paths of sign cert, sign key, and voting file
  const signingCertPath = utilities.getPathOSAgnostic(signingCert[0].fsPath);
  const signingKeyPath = utilities.getPathOSAgnostic(signingKey[0].fsPath);
  const votingFilePath = utilities.getPathOSAgnostic(
    specialContext.extensionPath + vote,
  );

  // Call the vote proposal function
  voteForProposal(
    networkUrl,
    signingCertPath,
    signingKeyPath,
    proposalId,
    votingFilePath,
    specialContext.extensionPath,
  );
}

// Function that runs the vote_proposal.sh script to vote on a proposal
async function voteForProposal(
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

async function sendBallot(networkUrl: string): Promise<string> {
  try {
    const command = `${utilities.getWsl()} curl ${networkUrl}/gov/proposals -k`;

    // Run the command and store the output
    let proposals = execSync(command).toString();

    // Remove the first and last character of the output
    proposals = proposals.slice(1, -1);

    if (proposals.length === 0) {
      vscode.window.showInformationMessage("No active proposals found");
      return "";
    }

    // Split the output into an array of proposals
    const regex = /(".{64}":{.*?})(?=,".{64}":|\s*$)/g;
    const proposalArray = proposals.match(regex);

    // Create a quick pick item for each ballot only displaying the ballot id
    const ballotQuickPickItems: vscode.QuickPickItem[] = [];
    proposalArray?.forEach((ballot) => {
      if (!ballot.includes("return false")) {
        const ballotId = ballot.slice(1, 65);
        ballotQuickPickItems.push({
          label: ballotId,
        });
      }
    });

    // FIXME: If there is only 1 proposal and it has been voted as false, the quick pick menu will not display
    // check if there are no ballotquickpick items
    if (ballotQuickPickItems.length === 0) {
      vscode.window.showInformationMessage("No active proposals found");
      return "";
    }

    const selectedBallot = await vscode.window.showQuickPick(
      ballotQuickPickItems,
      {
        ignoreFocusOut: true,
        placeHolder: "Select a ballot",
      },
    );

    // Check if no proposal was selected
    if (!selectedBallot) {
      vscode.window.showInformationMessage("No ballot selected");
      return "";
    }

    // Return the proposal id of the selected proposal
    return selectedBallot?.label ?? "";
  } catch (error: unknown) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(error.message);
    }
    return "";
  }
}

// Function that retrieves the appropriate voting file
export async function castVote(): Promise<string> {
  // Display a quick pick menu with vote accept or vote reject options
  const voteQuickPickItems: vscode.QuickPickItem[] = [
    {
      label: "Accept",
    },
    {
      label: "Reject",
    },
  ];

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
    return "/src/templates/shared-template/samples/ballots/vote_accept.json";
  } else {
    // return path of reject vote file
    return "/src/templates/shared-template/samples/ballots/vote_reject.json";
  }
}
