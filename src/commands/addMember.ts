import * as vscode from "vscode";
import { exec, execSync } from "child_process";
import path = require("path");
const fs = require("fs");

export async function addMember(context: vscode.ExtensionContext) {

    // Create a certificate directory folder in the current environment where member certificates will be stored
    const folderName = "Certificates";
    const currentPath = path.join(process.cwd(), folderName);

    function createFolder(directoryPath: string = process.cwd()) {
        try {
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
            }
            // Enter current folder
            process.chdir(directoryPath);
        }
        catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error creating certificates folder");
        }
    }

    // Prompt user to enter member name
    async function memberGenerator(memberName: string) {
        try {
            // If the member name already exists, report it to the user
            // If the folder contains a file with membername already, report it to the user and do not create new member
            if (currentPath.includes(memberName + "_cert.pem" || memberName + "_privk.pem")) {
                vscode.window.showInformationMessage("Member already exists");
                return;
            }

            // Generate the member certificates using the keygenerator.sh script
            const generateMember = execSync(
                "bash " + context.extensionPath + "/src/scripts/generateMember.sh --name " + memberName + " 2>&1"
            );

            // Show success message to user 
            vscode.window.showInformationMessage("Member " + memberName + " created successfully");

            // Create the .json file for the member
            createJsonFile(memberName);

        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error adding member");
        }
    }

    // Create the .json file for the member
    function createJsonFile(memberName: string) {
        try {
            // Generate a .JSON file for the user with the user's public certificate information
            // ********Will need to parse through the membername_cert.pem file to get the public certificate information

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

            // Navigate to the root directory of local environment
            const parentDirectory = path.join(process.cwd(), '..');

            process.chdir(parentDirectory);

            // Write the .json file into the current filepath
            fs.writeFileSync(fileName, JSON.stringify(fileContent));

        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error creating .json file");
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

    // Call the createFolder function
    createFolder(currentPath);

    // Call the memberGenerator function
    memberGenerator(memberName);

}
