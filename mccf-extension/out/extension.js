"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const Docker = require("dockerode");
function activate(context) {
    const docker = new Docker();
    let disposable = vscode.commands.registerCommand('extension.createDockerContainer', async () => {
        const imageName = await vscode.window.showQuickPick(['3.0.10', '3.0.11', '4.0.0', '4.0.3'], {
            placeHolder: 'Enter the version of CCF to be used',
            canPickMany: false,
            ignoreFocusOut: true
        });
        const container = await docker.createContainer({
            Image: `mcr.microsoft.com/ccf/app/run-js:${imageName}-virtual`
        });
        await container.start();
        vscode.window.showInformationMessage(`Container ${container.id} created and started`);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map