// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as sinon from "sinon";
import { startCCFNetworkDevContainer } from "../../commands/startCCFNetworkInDevContainer";

suite("Start CCF Network Dev Container tests", () => {
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
    showOpenDialogStub.resolves([vscode.Uri.file("path/to/app")]);

    await startCCFNetworkDevContainer();

    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
  });

  test("should fail when application file is not selected", async () => {
    // Mock user input and external functions
    showOpenDialogStub.resolves();

    await startCCFNetworkDevContainer();

    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "No application folder selected",
    );
  });
});
