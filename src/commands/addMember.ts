import * as vscode from "vscode";
import { exec, execSync } from "child_process";
import path = require("path");
import { chdir } from "process";
import { error } from "console";
const fs = require("fs");

export async function addMember(specialContext: vscode.ExtensionContext) {
    async function createFolder(folderName: string) {
        // Create a certificate directory path accessible by all functions in this command
        const certificatePath = path.join(process.cwd(), certificateFolder);

        // Check if the folder exists in the current file system. If not, create a certificates folder
        try {
            if (!fs.existsSync(certificatePath)) {
                fs.mkdirSync(certificatePath);
                vscode.window.showInformationMessage(
                    folderName + " directory created successfully"
                ); // show in the extension environment
            }
        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error creating certificates folder");
        }
    }

    // Member Generator function that runs the keygenerator.sh script to generate member certificates
    async function memberGenerator(memberName: string) {
        // Create a certificate directory path accessible by all functions in this command
        const certificatePath = path.join(process.cwd(), certificateFolder);

        // Access the files in the certificate folder directory
        const files = fs.readdirSync(certificatePath);
        try {
            // If the folder contains a file with membername already, report it to the user and do not overwrite member certificates
            if (files.includes(memberName + "_cert.pem" || files.includes(memberName + "_privk.pem"))) {
                vscode.window.showWarningMessage(
                    "Member already exists. Please enter a unique member name"
                );
                return;
            }
            vscode.window.showInformationMessage("Generating member certificates..."); // show in the extension environment

            // This will create a subshell to execute the script inside of the certificate directory path without changing our main process's working directory
            execSync(`(cd ${certificatePath.toString().trim()} && wsl bash '${result.toString().trim()}/src/scripts/keygenerator.sh' --name ${memberName})`);

        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error adding member");
        }

        // Show success message to user
        vscode.window.showInformationMessage(
            "Member " + memberName + " created successfully"
        );
    }

    // Function that runs the add_user.sh script to create user JSON file and later add them to the network
    // FIXME: This function is not working as intended. It is not creating the user JSON file or adding the user to the network. Still working on
    async function addUserProposal(memberName: string) {
        // Create a folder directory called ProposalFiles
        const proposalFolder = "ProposalFiles";

        // Create a proposal folder directory path
        const proposalPath = path.join(process.cwd(), proposalFolder);

        if (!fs.existsSync(proposalPath)) {
            fs.mkdirSync(proposalPath);
            vscode.window.showInformationMessage(
                proposalFolder + " directory created successfully"
            ); // show in the extension environment
        }

        // Creation the member's specific certificate file path
        const certificatePath = path.join(process.cwd(), certificateFolder);
        const certFilePath = path.join(certificatePath, memberName + "_cert.pem");

        // Change certFilePath to a wsl path
        const certFilePathWsl = execSync(`wsl wslpath -u '${certFilePath}'`);

        // Change ProposalPath to a wsl path
        const proposalResultWsl = execSync(`wsl wslpath -u '${proposalPath}'`);

        try {
            // FIXME: 
            // This will run the script and set the destination folder to the proposal folder
            execSync(`wsl bash ' ${result.toString().trim()}/src/scripts/add_user.sh' --cert-file ${certFilePathWsl.toString().trim()} --dest-folder ${proposalResultWsl.toString().trim()}`);

        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error passing user to network");
        }
    
    }  

    // Prompt user to enter member name
    const memberName = await vscode.window.showInputBox({
        prompt: "Enter the member name",
        placeHolder: "Member name",
    });

    // If no member name is entered, report it to the user
    if (!memberName || memberName.length === 0) {
        vscode.window.showInformationMessage("No member name entered");
        return;
    }

    // Create a certificate directory folder name accessible by all functions in this command
    const certificateFolder = "Certificates";

    // The following line translates the windows directory path to our extension into a wsl path
    const result = execSync(`wsl wslpath -u '${specialContext.extensionPath}'`);

    // Call the createFolder function
    createFolder(certificateFolder);

    // Call the memberGenerator function
    memberGenerator(memberName);

    // Call the addUserProposal function
    //addUserProposal(memberName);
}
