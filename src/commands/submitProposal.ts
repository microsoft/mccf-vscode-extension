import * as vscode from "vscode";
import { execSync } from 'child_process'; 
import path = require("path");

// context: vscode.ExtensionContext is for the extension to be able to access the extension path
export async function submitProposalCommand(context: vscode.ExtensionContext) {

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
    const certificateDir = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select certificate directory",
        title: "Select certificate directory",
    });

    // If no directory is selected, report it to the user
    if (!certificateDir || certificateDir.length === 0) {
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
    const result = execSync("bash " + context.extensionPath + "/src/scripts/submit_proposal.sh").toString();

    console.info(result);

    // Get the path of the certificate directory
    const certificateDirPaths = certificateDir.map(uri => uri.fsPath);
    
    // Convert the path to string
    const certificateDirString = certificateDirPaths.map(dir => path.join(dir));

    // Run the proposal script using the exec sync function
    const outputChannel = vscode.window.createOutputChannel("Script Output");

    const submitScriptCommand = execSync("./scripts/submit_proposal.sh --network-url " + networkUrl.toString() + " --certificate-dir " + certificateDirString + " --proposal-file " + proposalFile.toString() + " --member-count " + memberCount.toString());

    outputChannel.appendLine(submitScriptCommand.toString());

    outputChannel.show();
    
    } catch (error) {
        console.error("Proposal could not be submitted", error);
        vscode.window.showErrorMessage("Proposal failed to submit");
    }
}