// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as sinon from "sinon";
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

suite("Create Use Proposal tests", () => {
  let sandbox: sinon.SinonSandbox;

  let idGeneratorStub: sinon.SinonStub;

  let showInputBoxStub: sinon.SinonStub;
  let showOpenDialogStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    showInputBoxStub = sandbox.stub(vscode.window, "showInputBox");
    showOpenDialogStub = sandbox.stub(vscode.window, "showOpenDialog");
    showErrorMessageStub = sandbox.stub(vscode.window, "showErrorMessage");

    idGeneratorStub = sandbox.stub();
  });

  teardown(() => {
    sandbox.restore();
  });

  test("success behaviour", async () => {
    const rewireGenerateIdentity = rewire("../../commands/generateIdentity");

    // Mock user input and external functions
    showInputBoxStub.resolves("member0");
    showOpenDialogStub.resolves([vscode.Uri.file("path/to/cert.pem")]);

    idGeneratorStub.resolves();

    rewireGenerateIdentity.__set__("idGenerator", idGeneratorStub);

    await rewireGenerateIdentity.generateIdentity(mockContext);

    sinon.assert.calledOnce(idGeneratorStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
  });

  test("should fail when id name is not inserted", async () => {
    const rewireGenerateIdentity = rewire("../../commands/generateIdentity");

    // Mock user input and external functions
    showInputBoxStub.resolves();

    await rewireGenerateIdentity.generateIdentity(mockContext);

    sinon.assert.notCalled(idGeneratorStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No ID entered");
  });

  test("should fail when certificate is not selected", async () => {
    const rewireGenerateIdentity = rewire("../../commands/generateIdentity");

    // Mock user input and external functions
    showInputBoxStub.resolves("member0");
    showOpenDialogStub.resolves();

    await rewireGenerateIdentity.generateIdentity(mockContext);

    sinon.assert.notCalled(idGeneratorStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "No certificate folder selected",
    );
  });
});
