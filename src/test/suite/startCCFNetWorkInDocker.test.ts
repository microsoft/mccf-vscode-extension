// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as sinon from "sinon";
import { startCCFNetworkDocker } from "../../commands/startCCFNetworkInDocker";

suite("Start CCF Network Docker tests", () => {
  let sandbox: sinon.SinonSandbox;
  let showOpenDialogStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    showOpenDialogStub = sandbox.stub(vscode.window, "showOpenDialog");
    showErrorMessageStub = sandbox.stub(vscode.window, "showErrorMessage");
  });

  teardown(() => {
    sandbox.restore();
  });

  test("success behaviour", async () => {
    // Mock user input and external functions
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/dockerfile")]);
    showOpenDialogStub.onCall(1).resolves([vscode.Uri.file("path/to/app")]);

    await startCCFNetworkDocker();

    sinon.assert.calledTwice(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
  });

  test("should fail when docker file is not selected", async () => {
    // Mock user input and external functions
    showOpenDialogStub.onCall(0).resolves();

    await startCCFNetworkDocker();

    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No docker file selected");
  });

  test("should fail when application file is not selected", async () => {
    // Mock user input and external functions
    showOpenDialogStub
      .onCall(0)
      .resolves([vscode.Uri.file("path/to/dockerfile")]);
    showOpenDialogStub.onCall(1).resolves();

    await startCCFNetworkDocker();

    sinon.assert.calledTwice(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "No application folder selected",
    );
  });
});
