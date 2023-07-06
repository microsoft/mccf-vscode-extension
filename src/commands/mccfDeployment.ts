import { execSync } from "child_process";
import { window } from "vscode";
const {exec} = require("child_process");

export async function createMCCFInstance() {
    try {
<<<<<<< HEAD
        exec('az --version', (error: any, stdout: string, stderr: any) => {
            if (error) {
                console.log(error);
                return console.log('Please install Azure CLI before proceeding: ' + error);
            }

            // Check the output for Azure CLI version information
            const versionRegex = /azure-cli (\d+\.\d+\.\d+)/i;
            // Get the version number from the output.
             const match = stdout.match(versionRegex);

           // Returns the name of the current branch, or null if not on a branch.
           if (match && match[1]) {
                console.log(match);
                return Promise.resolve(match[1]);
            } else {
                console.log(stdout);
                return Promise.resolve(null);
            }
        });
    } catch (error) {
        console.log(error);
        return Promise.reject(error);
    }

    
    const certificateDir = await window.showInputBox({ prompt: 'Enter the certificate directory:' });
    const identifier = await window.showInputBox({ prompt: 'Enter the identifier:' });
    const names = await window.showInputBox({ prompt: 'Enter the name of your CCF Network' });
    const resourceGroup = await window.showInputBox({ prompt: 'Enter the resource group you want this instance to be placed' });

    execSync(`az confidentialledger managedccfs create --members "[{certificate:${certificateDir},identifier:${identifier}}]"--name ${names} --resource-group ${resourceGroup}`);
=======
        //Select the specific fiel 




    }catch (error) {

    }
createMCCFInstance().catch((error) => {
    console.error("Error occurred:", error);
});
>>>>>>> 08a1c247d53eb522da9c4bcc4fa54f6fad829e70
}