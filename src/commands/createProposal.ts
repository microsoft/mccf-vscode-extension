/* eslint-disable prettier/prettier */
import * as vscode from "vscode";
import path = require("path");
const fs = require("fs");
import * as utilities from "../Utilities/osUtilities";
import { execSync } from "child_process";

export async function createProposal(specialContext: vscode.ExtensionContext) {

    // Prompt user to enter Member name to generate the proposal for:
    const idName = await vscode.window.showInputBox({
        prompt: "Enter the ID to generate the proposal for",
        placeHolder: "Member name",
    });

    // If no member name is entered, report it to the user
    if (!idName || idName.length === 0) {
        vscode.window.showInformationMessage("No member name entered");
        return;
    }

    // Create a certificate directory folder name accessible by all functions in this command
    const certificateFolder = "Certificates";

    // Get a certificate directory path accessible by all functions
    const certificatePath = path.join(process.cwd(), certificateFolder);


    proposalCreator(idName, certificatePath, specialContext.extensionPath);

}

 // Create function that will check read files in the certificate folder and make sure that the member name entered exists
async function proposalCreator(id: string, certificatePath: string, extensionPath: string) {
    
    // Check if the member name entered exists in the certificate folder
    try {
        if (fs.existsSync(certificatePath)) {
            // Get the files in the certificate folder
            const files = fs.readdirSync(certificatePath);
            // Check if the member name entered exists in the certificate folder
            if (files.includes(id + "_cert.pem" || files.includes(id + "_enc_pubk.pem"))) {
                
                const wslCertificatePath = utilities.getExtensionPathOSAgnostic(certificatePath);
                
                // Run the add_member.sh script to add the member to the network using execSync
                execSync(`(cd ${extensionPath}/dist && ${utilities.getBashCommand()} add_member.sh --cert-file ${id}_cert.pem --pubk-file ${id}_enc_pubk.pem --dest-folder "${wslCertificatePath}")`);
            
            } else {
                vscode.window.showErrorMessage("ID does not exist");
                return;
            }
        }
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage("Error generating proposal");
    }

    // Display success message to user
    vscode.window.showInformationMessage("Proposal generated successfully");
} 
