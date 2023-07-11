import { execSync } from "child_process";
import { window } from "vscode";
const {exec} = require("child_process");
import * as vscode from 'vscode';
import { ConfidentialLedger } from "@azure/arm-confidentialledger";

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
    //Test Subscription ID (027da7f8-2fc6-46d4-9be9-560706b60fec)
    const subscriptionId =
    process.env["CONFIDENTIALLEDGER_SUBSCRIPTION_ID"];

    const certificateDir  = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select Certificate",
        title: "Select Certificate",
      });
      
      if (!certificateDir) {
        vscode.window.showErrorMessage('Please enter a directory for the certificate');
        return;
    }
    const certificateDirString = certificateDir[0].fsPath;
    const identifier = await window.showInputBox({ prompt: 'Enter the identifier:' });
    const names = await window.showInputBox({ prompt: 'Enter the name of your CCF Network' });
    const resourceGroup = await window.showInputBox({ prompt: 'Enter the resource group you want this instance to be placed' });

    if (!certificateDir) {
        vscode.window.showErrorMessage('Please enter a directory for the certificate');
    } else if (!identifier) {
        vscode.window.showErrorMessage('Please enter an identifier');
    } else if (!names) {
        vscode.window.showErrorMessage('Please enter a name for your CCF Network');
    } else if (!resourceGroup) {
        vscode.window.showErrorMessage('Please enter a resource group');
    }

    execSync(`az confidentialledger managedccfs create --members "[{certificate:'${certificateDirString}',identifier:'${identifier}}',group:'group1'}]" --name ${names} --resource-group ${resourceGroup}`);
    console.log('Creating CCF instance...');
    vscode.window.showInformationMessage('MCCF instance created successfully');
}