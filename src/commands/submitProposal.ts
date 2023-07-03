import * as vscode from "vscode";
import { execSync } from 'child_process'; 

export async function submitProposalCommand() {

    try{
    // Prompt user for network URL
    const networkUrl = await vscode.window.showInputBox({
        prompt: "Enter the network URL",
        placeHolder: "https://explorers1.confidential-ledger.azure.com" // temporary placeholder
    });

    // If no URL is entered, report it to the user
    if (!networkUrl) {
        vscode.window.showInformationMessage("No URL entered");
        return;
    }

    // Prompt user for certificate Directory
    const certificate_dir = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select certificate directory",
        title: "Select certificate directory",
    });

    // If no directory is selected, report it to the user
    if (!certificate_dir || certificate_dir.length === 0) {
        vscode.window.showInformationMessage("No directory selected");
        return;
    }

    // Prompt user for proposal file
    const proposalFile = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select proposal file",
        title: "Select proposal file",
    });

    // If no file is selected, report it to the user
    if (!proposalFile || proposalFile.length === 0) {
        vscode.window.showInformationMessage("No file selected");
        return;
    }

    // Prompt user for member count (integer value)
    const memberCountInput = await vscode.window.showInputBox({
        prompt: "Enter the number of members",
        placeHolder: "1 or more" // temporary placeholder
    });

    // If no member count is entered, report it to the user
    if (!memberCountInput) {
        vscode.window.showInformationMessage("No member count entered");
        return;
    }

    // Check if member count is an integer
    const memberCount = parseInt(memberCountInput);

    // If member count is not an integer, report it to the user
    if (isNaN(memberCount)|| !Number.isInteger(memberCount) || memberCount < 1) {
        vscode.window.showInformationMessage("Invalid member count. Please enter a positive integer value");
        return;
    }

    // Run the proposal script using the exec sync function
    execSync("./scripts/submit_proposal.sh --network-url " + networkUrl + " --certificate-dir " + certificate_dir + " --proposal-file " + proposalFile + " --member-count " + memberCount);

    } catch (error) {
        console.error("Proposal could not be submitted", error);
        vscode.window.showErrorMessage("Proposal failed to submit");
    }
}