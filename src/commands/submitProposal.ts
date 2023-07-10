import * as vscode from "vscode";
import { execSync } from 'child_process'; 
import path = require("path");

// context: vscode.ExtensionContext is for the extension to be able to access the extension path
export async function submitProposal(context: vscode.ExtensionContext) {

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
    vscode.window.showErrorMessage(networkUrl);
    

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
    vscode.window.showErrorMessage(certificateDir[0].fsPath);
    

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
    vscode.window.showErrorMessage(proposalFile[0].fsPath);

    // Prompt user for member count (integer value)
    const memberCountInput = await vscode.window.showInputBox({
        prompt: "Enter the number of members",
        placeHolder: "1" // temporary placeholder
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
    vscode.window.showErrorMessage(memberCountInput);

    const scriptPath = context.asAbsolutePath("src/commands/scripts/submit_proposal.sh");

    console.info(scriptPath);
    vscode.window.showErrorMessage(scriptPath);

    // Convert the paths to strings
    const certificateDirString = certificateDir[0].fsPath;
    const proposalFileString = proposalFile[0].fsPath;

    // Run the proposal script using the exec sync function
    const submitScriptCommand = execSync("bash " + scriptPath + " --network-url " + networkUrl + " --certificate-dir " + certificateDirString + " --proposal-file " + proposalFileString + " --member-count " + memberCount.toString());
    
    
    } catch (error) {
        console.error("Proposal could not be submitted", error);
        vscode.window.showErrorMessage("Proposal failed to submit");
    }
}