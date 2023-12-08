// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as sinon from "sinon";
import * as vote from "../../commands/voteProposal";
import * as extension from "../../Utilities/extensionUtils";
import * as errorUtils from "../../Utilities/errorUtils";
import * as utility from "../../Utilities/osUtilities";
const rewire = require("rewire");

const mockContext = {
  extensionPath: "/mocked/extension/path",
  subscriptions: [],
  workspaceState: {
    get: sinon.stub(),
    update: sinon.stub(),
  },
  globalState: {
    get: sinon.stub(),
    update: sinon.stub(),
  },
};

suite("Vote proposal integration tests", () => {
  let sandbox: sinon.SinonSandbox;
  let showInputBoxStub: sinon.SinonStub;
  let showOpenDialogStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;

  let getProposalStub: sinon.SinonStub;
  let castVoteStub: sinon.SinonStub;
  let runCommandStub: sinon.SinonStub;
  let logAndDisplayErrorStub: sinon.SinonStub;
  let getPathStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    showInputBoxStub = sandbox.stub(vscode.window, "showInputBox");
    showOpenDialogStub = sandbox.stub(vscode.window, "showOpenDialog");
    showErrorMessageStub = sandbox.stub(vscode.window, "showErrorMessage");
    showInformationMessageStub = sandbox.stub(
      vscode.window,
      "showInformationMessage",
    );

    getProposalStub = sandbox.stub();
    castVoteStub = sandbox.stub(vote, "castVote");
    runCommandStub = sandbox.stub(extension, "runCommandInTerminal");
    logAndDisplayErrorStub = sandbox.stub(errorUtils, "logAndDisplayError");
    getPathStub = sandbox.stub(utility, "getPathOSAgnostic");
  });

  teardown(() => {
    sandbox.restore();
  });

  test("success behaviour", async () => {
    const rewireVoteProposal = rewire("../../commands/voteProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/key.pem")]);

    getProposalStub.resolves("proposal1");
    castVoteStub.resolves("Accept");
    getPathStub.resolves((input: string) => input);

    rewireVoteProposal.__set__("getProposal", getProposalStub);
    rewireVoteProposal.__set__("castVote", castVoteStub);

    await rewireVoteProposal.voteProposal(mockContext);

    sinon.assert.calledOnce(getProposalStub);
    sinon.assert.calledOnce(castVoteStub);
    sinon.assert.calledOnce(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledTwice(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.calledWith(
      showInformationMessageStub,
      "Vote submission in progress",
    );
  });

  test("should fail when networkUrl is not selected", async () => {
    const rewireVoteProposal = rewire("../../commands/voteProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves();

    await rewireVoteProposal.voteProposal(mockContext);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.notCalled(getProposalStub);
    sinon.assert.notCalled(castVoteStub);
    sinon.assert.notCalled(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No network url entered");
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when proposal is null", async () => {
    const rewireVoteProposal = rewire("../../commands/voteProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    getProposalStub.resolves();
    rewireVoteProposal.__set__("getProposal", getProposalStub);

    await rewireVoteProposal.voteProposal(mockContext);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledOnce(getProposalStub);
    sinon.assert.notCalled(castVoteStub);
    sinon.assert.notCalled(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No proposal selected");
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when no vote is selected", async () => {
    const rewireVoteProposal = rewire("../../commands/voteProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    getProposalStub.resolves("proposal1");
    castVoteStub.resolves();

    rewireVoteProposal.__set__("getProposal", getProposalStub);
    rewireVoteProposal.__set__("castVote", castVoteStub);

    await rewireVoteProposal.voteProposal(mockContext);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledOnce(getProposalStub);
    sinon.assert.calledOnce(castVoteStub);
    sinon.assert.notCalled(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No vote selected");
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when no certificate is selected", async () => {
    const rewireVoteProposal = rewire("../../commands/voteProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    getProposalStub.resolves("proposal1");
    castVoteStub.resolves("Accept");
    showOpenDialogStub.onCall(0).resolves();

    rewireVoteProposal.__set__("getProposal", getProposalStub);
    rewireVoteProposal.__set__("castVote", castVoteStub);

    await rewireVoteProposal.voteProposal(mockContext);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledOnce(getProposalStub);
    sinon.assert.calledOnce(castVoteStub);
    sinon.assert.notCalled(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No signing cert selected");
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when no key is selected", async () => {
    const rewireVoteProposal = rewire("../../commands/voteProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    getProposalStub.resolves("proposal1");
    castVoteStub.resolves("Accept");
    showOpenDialogStub.onCall(0).resolves([vscode.Uri.file("cert.pem")]);
    showOpenDialogStub.onCall(1).resolves();

    rewireVoteProposal.__set__("getProposal", getProposalStub);
    rewireVoteProposal.__set__("castVote", castVoteStub);

    await rewireVoteProposal.voteProposal(mockContext);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledOnce(getProposalStub);
    sinon.assert.calledOnce(castVoteStub);
    sinon.assert.notCalled(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.calledTwice(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No signing key selected");
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when vote proposal command fails", async () => {
    const rewireVoteProposal = rewire("../../commands/voteProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/key.pem")]);

    getProposalStub.resolves("proposal1");
    castVoteStub.resolves("Accept");

    rewireVoteProposal.__set__("getProposal", getProposalStub);
    rewireVoteProposal.__set__("castVote", castVoteStub);
    const err = new Error("Command failed");
    runCommandStub.throws(err);

    await rewireVoteProposal.voteProposal(mockContext);

    sinon.assert.calledOnce(getProposalStub);
    sinon.assert.calledOnce(castVoteStub);
    sinon.assert.calledOnce(runCommandStub);
    sinon.assert.calledWith(
      logAndDisplayErrorStub,
      "Error when voting for a proposal",
    );

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledTwice(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.notCalled(showInformationMessageStub);
  });
});
