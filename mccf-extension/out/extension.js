"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const Docker = require("dockerode");
function activate(context) {
    const docker = new Docker();
    let disposable = vscode.commands.registerCommand('extension.createDockerContainer', async () => {
        const ccfVersion = await vscode.window.showQuickPick(['3.0.10', '3.0.11', '4.0.0', '4.0.3'], {
            placeHolder: 'Enter the version of CCF to be used',
            canPickMany: false,
            ignoreFocusOut: true
        });
        const imageName = 'mccf-extension';
        const imageTag = 'latest';
        const stream = await docker.buildImage({
            context: __dirname,
            src: ['dockerfile'],
        }, {
            buildargs: { 'CCF_VERSION': `${ccfVersion}`, },
            t: `${imageName}:${imageTag}`,
        });
        stream.setEncoding('utf8');
        const outputChannel = vscode.window.createOutputChannel('Docker Build Output');
        stream.on('data', (chunk) => {
            outputChannel.appendLine(chunk);
        });
        // Uncomment to create a container based on the previously built image
        /*const container = await docker.createContainer({
            Image: `mcr.microsoft.com/ccf/app/run-js:${ccfVersion}-virtual`,
            name: 'ccf',
        });
 
        await container.start();
 
        vscode.window.showInformationMessage(`Container ${container.id} created and started`);  */
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map