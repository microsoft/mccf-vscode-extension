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

/* try {
    const resourceGroup = await vscode.window.showInputBox({ prompt: 'Enter the resource group:' });
    if (!resourceGroup) {
      vscode.window.showErrorMessage('Please enter all the required fields and try again');
      return;
    }

    const outputFolderPath = path.join(vscode.workspace.rootPath || '', '.vscode-azure-managed-ccf');
    fs.mkdirSync(outputFolderPath, { recursive: true });

    const outputFile = path.join(outputFolderPath, 'mccf-instances.txt');

    const terminal = vscode.window.createTerminal('MCCF Instances');
    terminal.show();
    terminal.sendText(`az confidentialledger managedccfs list --resource-group ${resourceGroup} > ${outputFile}`);

    const onDidCloseTerminalDisposable = vscode.window.onDidCloseTerminal((closedTerminal) => {
      if (closedTerminal === terminal) {
        onDidCloseTerminalDisposable.dispose();

        // Read the output file
        fs.readFile(outputFile, 'utf-8', (err, data) => {
          if (err) {
            vscode.window.showErrorMessage('An error occurred while reading the output file: ' + err.message);
            return;
          }

          // Split the content into lines
          const lines = data.split('\n');

          // Create a webview panel to display the output
          const panel = vscode.window.createWebviewPanel(
            'mccfInstancesPanel',
            'MCCF Instances',
            vscode.ViewColumn.One,
            {
              enableScripts: true,
            }
          );

          // Construct the HTML content with a list box
          const htmlContent = `
            <html>
              <body>
                <h1>MCCF Instances</h1>
                <ul>
                  ${lines.map((line) => `<li>${line.trim()}</li>`).join('')}
                </ul>
              </body>
            </html>
          `;

          // Set the HTML content in the webview panel
          panel.webview.html = htmlContent;

          // Clean up the output file when the webview panel is closed
          panel.onDidDispose(() => {
            fs.unlinkSync(outputFile);
          });

          // Show the webview panel
          panel.reveal();
        });
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage('An error occurred: ' + error);
  }
}

 */
console.log('work in progress');