// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as sinon from "sinon";
import * as extension from "../../Utilities/extensionUtils";
import * as errorUtils from "../../Utilities/errorUtils";
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

suite("Submit proposal integration tests", () => {
  let sandbox: sinon.SinonSandbox;
  let showInputBoxStub: sinon.SinonStub;
  let showOpenDialogStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;

  let runCommandStub: sinon.SinonStub;
  let logAndDisplayErrorStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    showInputBoxStub = sandbox.stub(vscode.window, "showInputBox");
    showOpenDialogStub = sandbox.stub(vscode.window, "showOpenDialog");
    showErrorMessageStub = sandbox.stub(vscode.window, "showErrorMessage");
    showInformationMessageStub = sandbox.stub(
      vscode.window,
      "showInformationMessage",
    );

    runCommandStub = sandbox.stub(extension, "runCommandInTerminal");
    logAndDisplayErrorStub = sandbox.stub(errorUtils, "logAndDisplayError");
  });

  teardown(() => {
    sandbox.restore();
  });

  test("success behaviour", async () => {
    const rewireSubmitProposal = rewire("../../commands/submitProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/key.pem")]);
    showOpenDialogStub
      .onCall(2)
      .resolves([vscode.Uri.file("path/to/proposal.json")]);

    await rewireSubmitProposal.submitProposal(mockContext);

    sinon.assert.calledOnce(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledThrice(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.calledWith(
      showInformationMessageStub,
      "Proposal submission in progress",
    );
  });

  test("should fail when networkUrl is not selected", async () => {
    const rewireSubmitProposal = rewire("../../commands/submitProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves();

    await rewireSubmitProposal.submitProposal(mockContext);

    sinon.assert.notCalled(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "Invalid URL entered");
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when signing certificate is not selected", async () => {
    const rewireSubmitProposal = rewire("../../commands/submitProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    showOpenDialogStub.onCall(0).resolves();

    await rewireSubmitProposal.submitProposal(mockContext);

    sinon.assert.notCalled(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "No certificate file selected",
    );
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when signing key is not selected", async () => {
    const rewireSubmitProposal = rewire("../../commands/submitProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves();

    await rewireSubmitProposal.submitProposal(mockContext);

    sinon.assert.notCalled(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledTwice(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No key file selected");
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when proposal is not selected", async () => {
    const rewireSubmitProposal = rewire("../../commands/submitProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/key.pem")]);
    showOpenDialogStub.onCall(2).resolves();

    await rewireSubmitProposal.submitProposal(mockContext);

    sinon.assert.notCalled(runCommandStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledThrice(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No proposal file selected");
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when submit proposal command fails", async () => {
    const rewireSubmitProposal = rewire("../../commands/submitProposal");

    // Mock user input and external functions
    showInputBoxStub.resolves("https://test.confidential-ledger.azure.com");
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/key.pem")]);
    showOpenDialogStub
      .onCall(2)
      .resolves([vscode.Uri.file("path/to/proposal.json")]);

    const err = new Error("Command failed");
    runCommandStub.throws(err);

    await rewireSubmitProposal.submitProposal(mockContext);

    sinon.assert.calledOnce(runCommandStub);
    sinon.assert.calledOnce(logAndDisplayErrorStub);
    sinon.assert.calledWith(
      logAndDisplayErrorStub,
      "Proposal could not be submitted",
      err,
    );

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledThrice(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.notCalled(showInformationMessageStub);
  });
});
