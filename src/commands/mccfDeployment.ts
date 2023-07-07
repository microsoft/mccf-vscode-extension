import { execSync } from "child_process";
import { window } from "vscode";
const {exec} = require("child_process");
import * as vscode from 'vscode';

export async function createMCCFInstance() {
    try {
        exec('az --version', (error: any) => {
            if (error) {
                console.log(error);
                return console.log('Please install Azure CLI before proceeding: ' + error);
            }

        });
    } catch (error) {
        console.log(error);
        return Promise.reject(error);
    }

    execSync('az account set --subscription 027da7f8-2fc6-46d4-9be9-560706b60fec');
    
    const certificateDir = await window.showInputBox({ prompt: 'Enter the certificate directory:' });
    const identifier = await window.showInputBox({ prompt: 'Enter the identifier:' });
    const names = await window.showInputBox({ prompt: 'Enter the name of your CCF Network' });
    const resourceGroup = await window.showInputBox({ prompt: 'Enter the resource group you want this instance to be placed' });

    if (!certificateDir || !identifier || !names || !resourceGroup) {
        vscode.window.showErrorMessage('Please enter all the required fields and try again');
    }

    execSync(`az confidentialledger managedccfs create --members "[{certificate:'${certificateDir}',identifier:'${identifier}}',group:'group1'}]" --name ${names} --resource-group ${resourceGroup}`);
    
    vscode.window.showInformationMessage('MCCF instance created successfully');
}