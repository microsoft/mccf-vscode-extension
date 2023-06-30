import * as vscode from "vscode";
import { execSync } from 'child_process'; 

export async function submitProposalCommand() {

    try{
    // Prompt user for network URL
    const network_url = await vscode.window.showInputBox({
        prompt: "Enter the network URL",
        placeHolder: "https://explorers1.confidential-ledger.azure.com" // temporary placeholder
    });

    // If no URL is entered, report it to the user
    if (!network_url) {
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
    const proposal_file = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select proposal file",
        title: "Select proposal file",
    });

    // If no file is selected, report it to the user
    if (!proposal_file || proposal_file.length === 0) {
        vscode.window.showInformationMessage("No file selected");
        return;
    }

    // Prompt user for member count (integer value)
    const member_count = await vscode.window.showInputBox({
        prompt: "Enter the number of members",
        placeHolder: "1" // temporary placeholder
    });

    // If no member count is entered, report it to the user
    if (!member_count) {
        vscode.window.showInformationMessage("No member count entered");
        return;
    }

    // Run the proposal script using the exec sync function
    // How to pass in the parameters to the script?
    //execSync('./scripts/proposalscript.sh', [network_url, certificate_dir, proposal_file, member_count]);
    // above not working, need to figure out how to pass in parameters to the script

    // Create terminal
    const terminal = vscode.window.createTerminal("Proposal Submission");
    terminal.show();
    terminal.sendText("./scripts/proposalscript.sh " + network_url + " " + certificate_dir + " " + proposal_file + " " + member_count);

    } catch (error) {
        console.error("Proposal could not be submitted", error);
        vscode.window.showErrorMessage("Proposal failed to submit");
    }
}