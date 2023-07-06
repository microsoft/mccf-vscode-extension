import * as vscode from 'vscode';

export async function listMCCFInstaces() {
    try{
        const resourceGroup = await vscode.window.showInputBox({ prompt: 'Enter the resource group:' });
        if (!resourceGroup) {
            vscode.window.showErrorMessage('Please enter all the required fields and try again');
        }
        
        const terminal = vscode.window.createTerminal("MCCF Instances");
        terminal.show();
        terminal.sendText(`az confidentialledger managedccfs list --resource-group ${resourceGroup}`);

    } catch(error){
        vscode.window.showErrorMessage('An Error Occured: ' + error);

    };

}