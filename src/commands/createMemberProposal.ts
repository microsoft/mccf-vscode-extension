import * as vscode from "vscode";
import path = require("path");
const fs = require("fs");
import * as utilities from "../Utilities/osUtilities";
import { execSync } from "child_process";

export async function createMemberProposal(specialContext: vscode.ExtensionContext) {

    // Prompt user to enter Member name to generate the proposal for:
    const memberName = await vscode.window.showInputBox({
        prompt: "Enter the member name to generate the proposal for",
        placeHolder: "Member name",
    });

    // If no member name is entered, report it to the user
    if (!memberName || memberName.length === 0) {
        vscode.window.showInformationMessage("No member name entered");
        return;
    }

    // Create a certificate directory folder name accessible by all functions in this command
    const certificateFolder = "Certificates";

    // Get a certificate directory path accessible by all functions
    const certificatePath = path.join(process.cwd(), certificateFolder);
    // change certificate path to wsl path
    certificatePath.replace(/\\/g, "/");
    
    // The following line translates the windows directory path to our extension into a wsl path
    const extensionPath = utilities.getExtensionPathOSAgnostic(
        specialContext.extensionPath,
    );

    proposalCreator(memberName, certificatePath, extensionPath);

}

 // Create function that will check read files in the certificate folder and make sure that the member name entered exists
async function proposalCreator(memberName: string, certificatePath: string, extensionPath: string) {
    
    // ./add_member.sh --cert-file /path/to/cert.pem --pubk-file /path/to/pubk.pem --dest-folder /path/to/destination/folder.
    // Check if the member name entered exists in the certificate folder
    try {
        if (fs.existsSync(certificatePath)) {
            // Get the files in the certificate folder
            const files = fs.readdirSync(certificatePath);
            // Check if the member name entered exists in the certificate folder
            if (files.includes(memberName + "_cert.pem" || files.includes(memberName + "_privk.pem"))) {
               
                // Run the generate_keys.sh script to generate the member certificates using execSync
                //execSync(`${utilities.getBashCommand()} ${extensionPath}/dist/generate_keys.sh --id ${memberName} --dest-folder ${certificatePath}`);

                // Run the add_member.sh script to add the member to the network using execSync
                execSync(`${utilities.getBashCommand()} ${extensionPath}/dist/add_member.sh --cert-file ${certificatePath}/${memberName}_cert.pem --dest-folder ${certificatePath}`);
               
            } else {
                vscode.window.showErrorMessage("Member name does not exist");
                return;
            }
        }
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage("Error generating member proposal");
    }

    // Display success message to user
    vscode.window.showInformationMessage("Member proposal generated successfully");
} 
