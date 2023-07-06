import * as vscode from "vscode";
import { exec, execSync } from "child_process";
import path = require("path");
const fs = require("fs");

export async function addMember(context: vscode.ExtensionContext) {


    // Create a certificate directory folder in the current environment where member certificates will be stored
    const certificateFolder = "Certificates";

    function createFolder(folderName: string = process.cwd()) {
        // Check if the folder exists. If not, create a certificates folder
        try {
            if (!fs.existsSync(folderName)) {
                fs.mkdirSync(folderName);
            }
            // Enter current folder (Certificates folder)
            process.chdir(folderName);

            console.log("checkpoint --1 "); // testing purposes
        }
        catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error creating certificates folder");
        }
    }

    // Prompt user to enter member name
    async function memberGenerator(memberName: string) {
        // Read contents of certificates folder
        const currentPath = path.join(process.cwd(), certificateFolder);
        const files = fs.readdirSync(currentPath);

        try {
            // If the member name already exists, report it to the user
            // If the folder contains a file with membername already, report it to the user and do not create new member
            if (files.includes(memberName + "_cert.pem" || files.includes(memberName + "_privk.pem")) ) {
                vscode.window.showInformationMessage("Member already exists");
                return;
            }

            console.log("Generating member certificates...");
            
            // Generate the member certificates using the keygenerator.sh script
            execSync("bash " + context.extensionPath + "/src/scripts/keygenerator.sh --name " + memberName + " 2>&1");

            console.log("checkpoint --2 "); // testing purposes
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
    createFolder(certificateFolder);

    // Call the memberGenerator function
    memberGenerator(memberName);

    /*
    // Have program create new folder called "certificates" in the current directory
    //execSync("bash mkdir certificates");

    // alternative:
    //fs.mkdirSync("certificates");

    // Prompt user to enter member name
    const memberName = await vscode.window.showInputBox({
        prompt: "Enter the member name",
        placeHolder: "Member name",
    });


    // get extension path
    //const extensionPath = context.extensionPath;

    //console.log("next command 2: ");
    // print out extension path as string
    //vscode.window.showInformationMessage(extensionPath);
    //execSync("bash " + extensionPath + "/src/scripts/keygenerator.sh --name " + memberName + " 2>&1");

    // Create a new file called "memberName_cert.pem" in the certificates folder
    //execSync("openssl req -new -x509 -keyout certificates/" + memberName + "_privk.pem -out certificates/" + memberName + "_cert.pem -days 365 -subj '/CN=" + memberName + "'");
    //fs.writeFileSync(memberName);
    */
}
