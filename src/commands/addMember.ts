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

        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Error adding member");
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
