const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
//Function that creates the template files
function createTemplateFile(templateContent, fileName, outputDirectory) {
	const filePath = path.join(outputDirectory, fileName);

	// Create the output directory if it doesn't exist
	if (!fs.existsSync(outputDirectory)) {
		fs.mkdirSync(outputDirectory, { recursive: true });
	}
	//Error Handling
	fs.writeFile(filePath, templateContent, (err) => {
		if (err) {
			console.error('Error creating template file:', err);
			return;
		}

		console.log('Install File created successfully!');
	});
}

function activate(context) {
	console.log('Congratulations, your extension "script-enviroment-tester" is now active!');
	//Shows a message when the extension is activated
	let disposable = vscode.commands.registerCommand('script-enviroment-tester.helloWorld', function () {
		vscode.window.showInformationMessage(' Script Enviroment Tester Activated !');
	});
	//Runs the script when Install Enviroment command is called
	let scriptsRunner = vscode.commands.registerCommand('script-enviroment-tester.scriptRunner', function () {

			//Run This Script to Install all the required Enviroment for the project
			const { execSync } = require('child_process');

			//Starting virtual Enviorment
			console.log('Starting Virtual Enviroment...');
			execSync('python3 -m venv CCF Enviorment');

			// Install Python
			console.log('Installing Python...');

			//Install WSL
			execSync('wsl --install');

            //Connecting to WSL
            execSync('wsl') 

			// Install CCF Template
			console.log('Installing CCF App Template...');
			execSync('git clone https://github.com/microsoft/ccf-app-template')

			// Install the CCF sample applications
			//console.log('Installing CCF Sample Applications...');
			//execSync('git clone https://github.com/microsoft/ccf-app-samples/blob/main/banking-app')

			// Login to Azure CLI
			console.log('Logging into Azure CLI...');
			execSync('az login');

			//Install Node.js
			console.log('Installing Node.js...');
			execSync('curl -sL https://deb.nodesource.com/setup_14.x');

			console.log('Installation completed successfully.');
	});
	//Functions being called
	context.subscriptions.push(disposable);
	context.subscriptions.push(scriptsRunner);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
