import * as vscode from "vscode";
import { exec, execSync } from "child_process";
import path = require("path");
const fs = require("fs");

export async function addMember(context: vscode.ExtensionContext) {
    // Create a certificate directory folder in the current environment where we will store the member certificates
    function createFolder() {
        const folderName = "Certificates";
        const currentPath = path.join(process.cwd(), folderName);
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
        }

        // Enter current folder
        process.chdir(currentPath);
    }

    // Prompt user to enter member name
    async function memberGenerator(memberName: string) {
        try {
            // Generate the member certificates using the keygenerator.sh script
            const generateMember = execSync(
                "bash " + context.extensionPath + "/src/scripts/generateMember.sh --name " + memberName + " 2>&1"
            );

            // Show the output of the script
            vscode.window.showInformationMessage(generateMember.toString());
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
    createFolder();

    // Call the memberGenerator function
    memberGenerator(memberName);
}
