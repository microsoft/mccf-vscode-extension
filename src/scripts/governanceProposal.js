const readline = require('readline');
const { execSync } = require('child_process');

function usage() {
  console.log('');
  console.log('Submit a CCF proposal and automatically vote with acceptance.');
  console.log('');
  console.log('usage: node submit_proposal.js');
  console.log('');
  process.exit(0);
}

function failed(message) {
  console.error(`Script failed: ${message}\n\n`);
  process.exit(1);
}

function promptInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function runScript() {
  const networkUrl = await promptInput('Enter the CCF network URL: ');
  const certificateDir = await promptInput('Enter the certificate directory: ');
  const proposalFile = await promptInput('Enter the path to the proposal file: ');
  const memberCount = parseInt(await promptInput('Enter the number of network members needed to approve the proposal: '), 10);

  // Validate parameters
  if (!networkUrl) {
    failed('Missing network URL');
  } else if (!certificateDir) {
    failed('Missing certificate directory');
  } else if (!proposalFile) {
    failed('Missing proposal file');
  } else if (isNaN(memberCount) || memberCount < 1) {
    failed('Invalid member count');
  }

  const appDir = process.cwd(); // Application folder for reference
  const serviceCert = `${certificateDir}/service_cert.pem`;
  let signingCert = `${certificateDir}/member0_cert.pem`;
  let signingKey = `${certificateDir}/member0_privk.pem`;

  const proposal0Out = execSync(`/opt/ccf_virtual/bin/scurl.sh "${networkUrl}/gov/proposals" --cacert ${serviceCert} --signing-key ${signingKey} --signing-cert ${signingCert} --data-binary @${proposalFile} -H "content-type: application/json"`).toString();
  const proposal0Id = JSON.parse(proposal0Out).proposal_id;
  console.log(proposal0Id);

  // Proposal submitter vote for the proposal
  execSync(`/opt/ccf_virtual/bin/scurl.sh "${networkUrl}/gov/proposals/${proposal0Id}/ballots" --cacert ${serviceCert} --signing-key ${signingKey} --signing-cert ${signingCert} --data-binary @${appDir}/governance/vote/vote_accept.json -H "content-type: application/json"`);

  for (let i = 1; i < memberCount; i++) {
    signingCert = `${certificateDir}/member${i}_cert.pem`;
    signingKey = `${certificateDir}/member${i}_privk.pem`;
    execSync(`/opt/ccf_virtual/bin/scurl.sh "${networkUrl}/gov/proposals/${proposal0Id}/ballots" --cacert ${serviceCert} --signing-key ${signingKey} --signing-cert ${signingCert} --data-binary @${appDir}/governance/vote/vote_accept.json -H "content-type: application/json"`);
  }
}

if (process.argv.length > 2 && process.argv[2] === '--help') {
  usage();
}

runScript().catch((error) => {
  console.error('CCF proposal could not be submitted:', error);
  process.exit(1);
});

/* Extension Integration as a VSCode extension  command 

const vscode = require('vscode');
const { execSync } = require('child_process');

function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.submitProposal', async () => {
    try {
      const networkUrl = await vscode.window.showInputBox({ prompt: 'Enter the CCF network URL:' });
      const certificateDir = await vscode.window.showInputBox({ prompt: 'Enter the certificate directory:' });
      const proposalFile = await vscode.window.showInputBox({ prompt: 'Enter the path to the proposal file:' });
      const memberCount = await vscode.window.showInputBox({ prompt: 'Enter the number of network members needed to approve the proposal:' });

      // Validate parameters
      if (!networkUrl) {
        throw new Error('Missing network URL');
      } else if (!certificateDir) {
        throw new Error('Missing certificate directory');
      } else if (!proposalFile) {
        throw new Error('Missing proposal file');
      } else if (isNaN(memberCount) || parseInt(memberCount, 10) < 1) {
        throw new Error('Invalid member count');
      }

      const appDir = vscode.workspace.rootPath; // Application folder for reference
      const serviceCert = `${certificateDir}/service_cert.pem`;
      let signingCert = `${certificateDir}/member0_cert.pem`;
      let signingKey = `${certificateDir}/member0_privk.pem`;

      const proposal0Out = execSync(`/opt/ccf_virtual/bin/scurl.sh "${networkUrl}/gov/proposals" --cacert ${serviceCert} --signing-key ${signingKey} --signing-cert ${signingCert} --data-binary @${proposalFile} -H "content-type: application/json"`).toString();
      const proposal0Id = JSON.parse(proposal0Out).proposal_id;
      vscode.window.showInformationMessage(`Proposal ID: ${proposal0Id}`);

      // Proposal submitter vote for the proposal
      execSync(`/opt/ccf_virtual/bin/scurl.sh "${networkUrl}/gov/proposals/${proposal0Id}/ballots" --cacert ${serviceCert} --signing-key ${signingKey} --signing-cert ${signingCert} --data-binary @${appDir}/governance/vote/vote_accept.json -H "content-type: application/json"`);

      for (let i = 1; i < parseInt(memberCount, 10); i++) {
        signingCert = `${certificateDir}/member${i}_cert.pem`;
        signingKey = `${certificateDir}/member${i}_privk.pem`;
        execSync(`/opt/ccf_virtual/bin/scurl.sh "${networkUrl}/gov/proposals/${proposal0Id}/ballots" --cacert ${serviceCert} --signing-key ${signingKey} --signing-cert ${signingCert} --data-binary @${appDir}/governance/vote/vote_accept.json -H "content-type: application/json"`);
      }

      vscode.window.showInformationMessage('CCF proposal submitted successfully.');
    } catch (error) {
      console.error('CCF proposal could not be submitted:', error);
      vscode.window.showErrorMessage('CCF proposal submission failed.');
    }
  });

  context.subscriptions.push(disposable);
}
exports.activate = activate;

*/

