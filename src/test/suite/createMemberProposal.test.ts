// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as sinon from "sinon";
import * as utility from "../../Utilities/osUtilities";
import fs = require("fs");
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

suite("Create Member Proposal tests", () => {
  let sandbox: sinon.SinonSandbox;

  let generateProposalStub: sinon.SinonStub;
  let existStub: sinon.SinonStub;
  let getPathStub: sinon.SinonStub;

  let showInputBoxStub: sinon.SinonStub;
  let showOpenDialogStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    showInputBoxStub = sandbox.stub(vscode.window, "showInputBox");
    showOpenDialogStub = sandbox.stub(vscode.window, "showOpenDialog");
    showErrorMessageStub = sandbox.stub(vscode.window, "showErrorMessage");

    generateProposalStub = sandbox.stub();
    existStub = sandbox.stub(fs, "existsSync");
    getPathStub = sandbox.stub(utility, "getPathOSAgnostic");
  });

  teardown(() => {
    sandbox.restore();
  });

  test("success behaviour", async () => {
    const rewireCreateMemberProposal = rewire(
      "../../commands/createMemberProposal",
    );

    // Mock user input and external functions
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/key.pem")]);
    showOpenDialogStub
      .onCall(2)
      .resolves([vscode.Uri.file("path/to/destination")]);
    showInputBoxStub.resolves("proposal");

    existStub.returns(false);
    generateProposalStub.resolves();
    getPathStub.resolves((input: string) => input);

    rewireCreateMemberProposal.__set__(
      "generateProposal",
      generateProposalStub,
    );

    await rewireCreateMemberProposal.createMemberProposal(mockContext);

    sinon.assert.calledOnce(existStub);
    sinon.assert.calledOnce(generateProposalStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledThrice(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
  });

  test("should fail when certificate is not selected", async () => {
    const rewireCreateMemberProposal = rewire(
      "../../commands/createMemberProposal",
    );

    // Mock user input and external functions
    showOpenDialogStub.onCall(0).resolves();

    await rewireCreateMemberProposal.createMemberProposal(mockContext);

    sinon.assert.notCalled(existStub);
    sinon.assert.notCalled(generateProposalStub);

    sinon.assert.notCalled(showInputBoxStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "No certificate file selected",
    );
  });

  test("should not fail when encryption key is not selected", async () => {
    const rewireCreateMemberProposal = rewire(
      "../../commands/createMemberProposal",
    );

    // Mock user input and external functions
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves();
    showOpenDialogStub
      .onCall(2)
      .resolves([vscode.Uri.file("path/to/destination")]);
    showInputBoxStub.resolves("proposal");

    existStub.returns(false);
    generateProposalStub.resolves();
    getPathStub.resolves((input: string) => input);

    rewireCreateMemberProposal.__set__(
      "generateProposal",
      generateProposalStub,
    );

    await rewireCreateMemberProposal.createMemberProposal(mockContext);

    sinon.assert.calledOnce(existStub);
    sinon.assert.calledOnce(generateProposalStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledThrice(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
  });

  test("should fail when destination is not selected", async () => {
    const rewireCreateMemberProposal = rewire(
      "../../commands/createMemberProposal",
    );

    // Mock user input and external functions
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/key.pem")]);
    showOpenDialogStub.onCall(2).resolves();

    await rewireCreateMemberProposal.createMemberProposal(mockContext);

    sinon.assert.notCalled(existStub);
    sinon.assert.notCalled(generateProposalStub);

    sinon.assert.notCalled(showInputBoxStub);
    sinon.assert.calledThrice(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "No destination folder selected",
    );
  });

  test("should fail when proposal name is not inserted", async () => {
    const rewireCreateMemberProposal = rewire(
      "../../commands/createMemberProposal",
    );

    // Mock user input and external functions
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/key.pem")]);
    showOpenDialogStub
      .onCall(2)
      .resolves([vscode.Uri.file("path/to/destination")]);
    showInputBoxStub.resolves();

    await rewireCreateMemberProposal.createMemberProposal(mockContext);

    sinon.assert.notCalled(existStub);
    sinon.assert.notCalled(generateProposalStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledThrice(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No valid id name entered");
  });

  test("should fail when file name already exists", async () => {
    const rewireCreateMemberProposal = rewire(
      "../../commands/createMemberProposal",
    );

    // Mock user input and external functions
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/cert.pem")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/key.pem")]);
    showOpenDialogStub
      .onCall(2)
      .resolves([vscode.Uri.file("path/to/destination")]);
    showInputBoxStub.resolves("proposal");

    existStub.returns(true);

    await rewireCreateMemberProposal.createMemberProposal(mockContext);

    sinon.assert.calledOnce(existStub);
    sinon.assert.notCalled(generateProposalStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledThrice(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "Proposal file with that name already exists in destination folder.",
    );
  });
});
