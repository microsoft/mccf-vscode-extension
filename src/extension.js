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
		const docker = new Docker();

docker.ping((err) => {
  if (err) {
    console.error('Docker is required but not installed. Aborting.');
    process.exit(1);
  }

  // Check if a folder name is provided as an argument
  if (process.argv.length < 3) {
    console.error('Please provide a folder name.');
    console.log('Usage: node create_dev_container.js <folder_name>');
    process.exit(1);
  }

  const folderName = process.argv[2];
  const folderPath = path.resolve(folderName);

  // Create the folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  // Create a Dockerfile for the development container
  const dockerfileContent = `\
    FROM ubuntu:latest
    RUN apt-get update && apt-get install -y build-essential
    WORKDIR /app
  `;

  fs.writeFileSync(path.join(folderPath, 'Dockerfile'), dockerfileContent);

  // Build the Docker image
  docker.buildImage(
    {
      context: folderPath,
      src: ['Dockerfile']
    },
    { t: 'dev_container' },
    (err, stream) => {
      if (err) {
        console.error('Failed to build the Docker image:', err);
        process.exit(1);
      }

      stream.pipe(process.stdout);

      stream.on('end', () => {
        // Clean up the Dockerfile
        fs.unlinkSync(path.join(folderPath, 'Dockerfile'));

        // Provide instructions to the user
        console.log('Dev container created successfully.');
        console.log('To start the container, use the following command:');
        console.log(`docker run -it --rm -v ${folderPath}:/app dev_container`);
      });
    }
  );
});
		vscode.window.showInformationMessage('Template file created successfully!');
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
