import * as vscode from 'vscode';
import * as Docker from 'dockerode';
import path = require('path');
import fs = require('fs');

export function activate(context: vscode.ExtensionContext) {
    const docker = new Docker();

    let disposable = vscode.commands.registerCommand('extension.createDockerContainer', async () => {

        const ccfVersion = await vscode.window.showQuickPick(['3.0.10', '3.0.11', '4.0.0', '4.0.3'], {
            placeHolder: 'Enter the version of CCF to be used',
            canPickMany: false,
            ignoreFocusOut: true
        });

        const dockerfilePath = path.join(__dirname, 'dockerfile');
        const contextPath = path.join(__dirname, '.');

        // List all files in the current directory
        fs.readdir(contextPath, (err, files) => {
            if (err) {
                vscode.window.showErrorMessage(`Error reading directory: ${err}`);
                return;
            }
            console.log(files);
        });

        const stream = await docker.buildImage(
            {
                context: contextPath,
                src: [dockerfilePath],
            },
            {
                buildargs: { 'CCF_VERSION': `${ccfVersion}`, },
            });

        stream.setEncoding('utf8');
        stream.on('data', (chunk) => {
            vscode.window.createOutputChannel('Docker Build Output').appendLine(chunk);
        }); 

         /*const container = await docker.createContainer({
             Image: `mcr.microsoft.com/ccf/app/run-js:${ccfVersion}-virtual`,
             name: 'ccf',
         }); 
 
         await container.start();
 
         vscode.window.showInformationMessage(`Container ${container.id} created and started`);  */
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }