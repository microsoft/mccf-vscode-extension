import * as vscode from "vscode";
import { exec, execSync } from 'child_process'; 
const fs = require('fs');

export async function addMember(context: vscode.ExtensionContext){

    try {
        // Prompt user to enter the member name
        const memberName = await vscode.window.showInputBox({
            prompt: "Enter the member name",
            placeHolder: "Member name"
        });
    
        // If no member name is entered, report it to the user
        if (!memberName || memberName.length === 0) {
            vscode.window.showInformationMessage("No member name entered");
            return;
        }
    
        // Create a certificate directory folder where we will store the member certificates
        const folderName = "Certificates";
        if (!fs.existsSync(folderName)){
            fs.mkdirSync(folderName);
        }

        // Enter the folder 
        process.chdir(folderName);

        // Run the script using the user input as a parameter
        // context.extensionPath is the path to the extension folder but is not working
        const addMember = execSync("bash " + context.extensionPath + "/src/scripts/addMember.sh --name " + memberName + " 2>&1");
   
        
    } catch (error) {
        console.error(error);
        // show the error
        vscode.window.showErrorMessage("Error adding member");
    }

}
