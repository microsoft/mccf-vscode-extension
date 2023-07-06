import * as vscode from 'vscode';
import { execSync } from 'child_process';
import {exec} from 'child_process';

export async function listMCCFInstaces() {
    try{
        const resourceGroup = await vscode.window.showInputBox({ prompt: 'Enter the resource group:' });
        if (!resourceGroup) {
            vscode.window.showErrorMessage('Please enter all the required fields and try again');
        }

    } catch(error){


    };

}