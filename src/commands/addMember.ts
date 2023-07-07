import * as vscode from "vscode";
import { exec, execSync } from "child_process";
import path = require("path");
import { chdir } from "process";
const fs = require("fs");

export async function addMember(specialContext: vscode.ExtensionContext) {

    async function createFolder(folderName: string) {

        // Check if the folder exists in the current file system. If not, create a certificates folder
        try {
            if (!fs.existsSync(certificatePath)) {
                fs.mkdirSync(certificatePath);
                vscode.window.showInformationMessage(folderName + " directory created successfully"); // show in the extension environment
            }

        }
        catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error creating certificates folder");
        }
    }

    // Member Generator function that runs the keygenerator.sh script to generate member certificates
    async function memberGenerator(memberName: string) {

        // Translate our certificate path to a wsl path
        const currentPathWsl = execSync(`wsl wslpath -u '${certificatePath}'`);

        // Read the files in the current directory
        const files = fs.readdirSync(certificatePath);
        try {
            // If the folder contains a file with membername already, report it to the user and do not overwrite member certificates
            if (files.includes(memberName + "_cert.pem" || files.includes(memberName + "_privk.pem"))) {
                vscode.window.showWarningMessage("Member already exists. Please enter a unique member name");
                return;
            }

            vscode.window.showInformationMessage("Generating member certificates..."); // show in the extension environment

            // The following line translates the windows directory path to our extension into a wsl path
            const result = execSync(`wsl wslpath -u '${specialContext.extensionPath}'`);

            // This will create a subshell to execute the script inside of the certificate directory path without changing our main process's working directory
            execSync(`(cd ${certificatePath.toString().trim()} && wsl bash '${result.toString().trim()}/src/scripts/keygenerator.sh' --name ${memberName})`);

            // Create the .json file for the member
            //createJsonFile(memberName);

        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error adding member");
        }

        // Show success message to user
        vscode.window.showInformationMessage("Member " + memberName + " created successfully");
    }

    // Create the .json file for the member - SCRAP CODE
    function createJsonFile(memberName: string) {
        try {
            // Generate a .JSON file for the user with the user's public certificate information
            // ********Will need to parse through the membername_cert.pem file to get the public certificate information. This has not been done yet

            const fileName = "set_" + memberName + ".json";
            const fileContent = {
                "actions:": [
                    {
                        "name": "set_user",
                        "args": {
                            "cert": "-----BEGIN CERTIFICATE----- \insert parsed information here\ -----END CERTIFICATE-----\n"
                        }
                    }
                ]
            };

            console.log("checkpoint --3 "); // testing purposes
            // Navigate to the root directory of local environment
            const parentDirectory = path.join(process.cwd(), '..');
            process.chdir(parentDirectory);

            // Write the .json file into the current filepath
            fs.writeFileSync(fileName, JSON.stringify(fileContent));

        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error creating member json file");
        }
    }

    // Function that runs the add_user.sh script to create user JSON file and later add them to the network
    async function addUserProposal(memberName: string) {

        // Command for running addUser.sh script: ./add_user.sh --cert-file /path/to/cert.pem --dest-folder /path/to/destination/folder
        // Access the files in the certificate folder directory
        const files = fs.readdirSync(certificatePath);

        // Look in the files to find the file name that matches: memberName_cert.pem
        const certFile = files.find((file: string) => file.includes(memberName + "_cert.pem"));

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

    const certificatePath = path.join(process.cwd(), certificateFolder);

    // Call the createFolder function
    createFolder(certificateFolder);

    // Call the memberGenerator function
    memberGenerator(memberName);

}
