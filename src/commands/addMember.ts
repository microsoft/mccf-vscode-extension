import * as vscode from "vscode";
import { exec, execSync } from 'child_process'; 

export async function addMemberCommand(context: vscode.ExtensionContext){

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
    
        // Run the script using the user input as a parameter
        const addMember = execSync("bash " + context.extensionPath + "src/scripts/addMember.sh --name" + memberName);

    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage("Error adding member");
    }
    

}
