// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as sinon from "sinon";
import * as path from "path";
import * as os from "os";
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

suite("Create Dev Container tests", () => {
  let sandbox: sinon.SinonSandbox;

  let initializeProjectFoldersStub: sinon.SinonStub;

  let showQuickPickStub: sinon.SinonStub;
  let showInputBoxStub: sinon.SinonStub;
  let showOpenDialogStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick");
    showInputBoxStub = sandbox.stub(vscode.window, "showInputBox");
    showOpenDialogStub = sandbox.stub(vscode.window, "showOpenDialog");
    showErrorMessageStub = sandbox.stub(vscode.window, "showErrorMessage");

    initializeProjectFoldersStub = sandbox.stub();
  });

  teardown(() => {
    sandbox.restore();
  });

  test("success behaviour", async () => {
    const rewireCreateDevContainer = rewire(
      "../../commands/createDevContainer",
    );

    // Mock user input and external functions
    showQuickPickStub.resolves({
      label: "Sample Basic App",
      sourceFolder: "basic-app",
    });
    showOpenDialogStub.resolves([vscode.Uri.file(__dirname)]);
    showInputBoxStub.resolves("test");

    initializeProjectFoldersStub.resolves();

    rewireCreateDevContainer.__set__(
      "initializeProjectFolder",
      initializeProjectFoldersStub,
    );

    await rewireCreateDevContainer.createDevContainerCommand(mockContext);

    sinon.assert.calledOnce(initializeProjectFoldersStub);

    sinon.assert.calledOnce(showQuickPickStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.notCalled(showErrorMessageStub);

    fs.rm(path.join(__dirname, "test"), { recursive: true }, (err) => {
      if (err) {
        // File deletion failed
        console.error(err.message);
      }
    });
  });

  test("should fail when template app is not selected", async () => {
    const rewireCreateDevContainer = rewire(
      "../../commands/createDevContainer",
    );

    // Mock user input and external functions
    showQuickPickStub.resolves();

    await rewireCreateDevContainer.createDevContainerCommand(mockContext);

    sinon.assert.notCalled(initializeProjectFoldersStub);

    sinon.assert.calledOnce(showQuickPickStub);
    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.notCalled(showInputBoxStub);
    sinon.assert.calledWith(showErrorMessageStub, "No template was selected");
  });

  test("should fail when destination folder is not selected", async () => {
    const rewireCreateDevContainer = rewire(
      "../../commands/createDevContainer",
    );

    // Mock user input and external functions
    showQuickPickStub.resolves({
      label: "Sample Basic App",
      sourceFolder: "basic-app",
    });
    showOpenDialogStub.resolves();

    await rewireCreateDevContainer.createDevContainerCommand(mockContext);

    sinon.assert.notCalled(initializeProjectFoldersStub);

    sinon.assert.calledOnce(showQuickPickStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.notCalled(showInputBoxStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "No destination folder selected",
    );
  });

  test("should fail when project name is not inserted", async () => {
    const rewireCreateDevContainer = rewire(
      "../../commands/createDevContainer",
    );

    // Mock user input and external functions
    showQuickPickStub.resolves({
      label: "Sample Basic App",
      sourceFolder: "basic-app",
    });
    showOpenDialogStub.resolves([vscode.Uri.file(__dirname)]);
    showInputBoxStub.resolves();

    await rewireCreateDevContainer.createDevContainerCommand(mockContext);

    sinon.assert.notCalled(initializeProjectFoldersStub);

    sinon.assert.calledOnce(showQuickPickStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledWith(showErrorMessageStub, "No project name entered");
  });

  test("should fail when folder path already existed", async () => {
    const rewireCreateDevContainer = rewire(
      "../../commands/createDevContainer",
    );

    // Mock user input and external functions
    showQuickPickStub.resolves({
      label: "Sample Basic App",
      sourceFolder: "basic-app",
    });
    showOpenDialogStub.resolves([vscode.Uri.file(os.tmpdir())]);
    showInputBoxStub.resolves("test");

    // Create temp directory that matches the mock folder path
    const tempDir = path.join(os.tmpdir(), "test");
    fs.mkdirSync(tempDir);

    await rewireCreateDevContainer.createDevContainerCommand(mockContext);

    sinon.assert.notCalled(initializeProjectFoldersStub);

    sinon.assert.calledOnce(showQuickPickStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "Folder already exists. Please choose a different name",
    );

    fs.rm(tempDir, { recursive: true }, (err) => {
      if (err) {
        // File deletion failed
        console.error(err.message);
      }
    });
  });
});
