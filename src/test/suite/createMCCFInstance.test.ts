import * as vscode from "vscode";
import * as sinon from "sinon";
import { createMCCFInstance } from "../../commands/createMCCFInstance";
import * as utility from "../../Utilities/azureUtilities";
import * as errorUtils from "../../Utilities/errorUtils";
import * as azureUtils from "../../Utilities/azureUtilities";

suite("Create MCCF Instance Details integration tests", () => {
  let sandbox: sinon.SinonSandbox;
  let listSubscriptionsStub: sinon.SinonStub;
  let azureMCCFSetupStub: sinon.SinonStub;
  let listResourceGroupsStub: sinon.SinonStub;
  let logAndDisplayErrorStub: sinon.SinonStub;
  let createInstanceStub: sinon.SinonStub;
  let showMCCFInstanceDetailsStub: sinon.SinonStub;

  let showInputBoxStub: sinon.SinonStub;
  let showQuickPickStub: sinon.SinonStub;
  let showOpenDialogStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    listSubscriptionsStub = sandbox.stub(utility, "listSubscriptions");
    azureMCCFSetupStub = sandbox.stub(utility, "azureMCCFSetup");
    listResourceGroupsStub = sandbox.stub(utility, "listResourceGroups");
    logAndDisplayErrorStub = sandbox.stub(errorUtils, "logAndDisplayError");
    createInstanceStub = sandbox.stub(utility, "createInstance");
    showMCCFInstanceDetailsStub = sandbox.stub(
      azureUtils,
      "showMCCFInstanceDetails",
    );

    showInputBoxStub = sandbox.stub(vscode.window, "showInputBox");
    showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick");
    showOpenDialogStub = sandbox.stub(vscode.window, "showOpenDialog");
    showErrorMessageStub = sandbox.stub(vscode.window, "showErrorMessage");
    showInformationMessageStub = sandbox.stub(
      vscode.window,
      "showInformationMessage",
    );
  });

  teardown(() => {
    sandbox.restore();
  });

  test("success behaviour", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    azureMCCFSetupStub.resolves();
    listResourceGroupsStub.resolves("testResourceGroup");

    showInputBoxStub.onCall(0).resolves("test-mccf-instance");

    showQuickPickStub.onCall(0).resolves({
      label: "region",
      value: "test-region",
    });
    showQuickPickStub.onCall(1).resolves({
      value: "JS",
    });
    showQuickPickStub.onCall(2).resolves({
      value: "sample",
    });

    showOpenDialogStub.resolves([vscode.Uri.file(__filename)]);
    showInputBoxStub.onCall(1).resolves("member0");
    showInputBoxStub.onCall(2).resolves("3");

    createInstanceStub.resolves();

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(azureMCCFSetupStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);
    sinon.assert.calledOnce(createInstanceStub);
    sinon.assert.calledWith(
      showMCCFInstanceDetailsStub,
      "test-mccf-instance",
      "testresourcegroup",
      "testSubscription",
    );

    sinon.assert.calledThrice(showInputBoxStub);
    sinon.assert.calledThrice(showQuickPickStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.calledWith(
      showInformationMessageStub,
      "Azure Managed CCF resource was created successfully",
    );
  });

  test("should fail when listSubscriptions returns an error", async () => {
    // Mock user input and external functions
    const err = new Error("test error message");
    listSubscriptionsStub.rejects(err);

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.notCalled(azureMCCFSetupStub);
    sinon.assert.notCalled(listResourceGroupsStub);
    sinon.assert.notCalled(createInstanceStub);
    sinon.assert.calledWith(
      logAndDisplayErrorStub,
      "Failed to create MCCF instance",
      err,
    );
    sinon.assert.notCalled(showMCCFInstanceDetailsStub);

    sinon.assert.notCalled(showInputBoxStub);
    sinon.assert.notCalled(showQuickPickStub);
    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when listResourceGroups returns an error", async () => {
    // Mock user input and external functions
    const err = new Error("test error message");
    listSubscriptionsStub.resolves("testSubscription");
    azureMCCFSetupStub.resolves();
    listResourceGroupsStub.rejects(err);

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(azureMCCFSetupStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.calledWith(
      logAndDisplayErrorStub,
      "Failed to create MCCF instance",
      err,
    );
    sinon.assert.notCalled(showMCCFInstanceDetailsStub);

    sinon.assert.notCalled(showInputBoxStub);
    sinon.assert.notCalled(showQuickPickStub);
    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when instance name is not inserted", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    azureMCCFSetupStub.resolves();
    listResourceGroupsStub.resolves("testResourceGroup");

    showInputBoxStub.onCall(0).resolves();

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(azureMCCFSetupStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);
    sinon.assert.notCalled(showMCCFInstanceDetailsStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.notCalled(showQuickPickStub);
    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "Please enter a valid name for the MCCF instance",
    );
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when region is not selected", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    azureMCCFSetupStub.resolves();
    listResourceGroupsStub.resolves("testResourceGroup");

    showInputBoxStub.onCall(0).resolves("test-mccf-instance");
    showQuickPickStub.onCall(0).resolves();

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(azureMCCFSetupStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);
    sinon.assert.notCalled(showMCCFInstanceDetailsStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledOnce(showQuickPickStub);
    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.calledWith(showErrorMessageStub, "No region was selected");
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when language is not selected", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    azureMCCFSetupStub.resolves();
    listResourceGroupsStub.resolves("testResourceGroup");

    showInputBoxStub.onCall(0).resolves("test-mccf-instance");
    showQuickPickStub.onCall(0).resolves({
      label: "region",
      value: "test-region",
    });
    showQuickPickStub.onCall(1).resolves();

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(azureMCCFSetupStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);
    sinon.assert.notCalled(showMCCFInstanceDetailsStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledTwice(showQuickPickStub);
    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "No language runtime was selected",
    );
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when application type is not selected", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    azureMCCFSetupStub.resolves();
    listResourceGroupsStub.resolves("testResourceGroup");

    showInputBoxStub.onCall(0).resolves("test-mccf-instance");
    showQuickPickStub.onCall(0).resolves({
      label: "region",
      value: "test-region",
    });
    showQuickPickStub.onCall(1).resolves({
      value: "JS",
    });
    showQuickPickStub.onCall(2).resolves();

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(azureMCCFSetupStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);
    sinon.assert.notCalled(showMCCFInstanceDetailsStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledThrice(showQuickPickStub);
    sinon.assert.notCalled(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "No application type was selected",
    );
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when certificate is not selected", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    azureMCCFSetupStub.resolves();
    listResourceGroupsStub.resolves("testResourceGroup");

    showInputBoxStub.onCall(0).resolves("test-mccf-instance");
    showQuickPickStub.onCall(0).resolves({
      label: "region",
      value: "test-region",
    });
    showQuickPickStub.onCall(1).resolves({
      value: "JS",
    });
    showQuickPickStub.onCall(2).resolves({
      value: "sample",
    });

    showOpenDialogStub.resolves();

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(azureMCCFSetupStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);
    sinon.assert.notCalled(showMCCFInstanceDetailsStub);

    sinon.assert.calledOnce(showInputBoxStub);
    sinon.assert.calledThrice(showQuickPickStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "Please select a valid member certificate file",
    );
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when member id is not inserted", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    azureMCCFSetupStub.resolves();
    listResourceGroupsStub.resolves("testResourceGroup");

    showInputBoxStub.onCall(0).resolves("test-mccf-instance");
    showQuickPickStub.onCall(0).resolves({
      label: "region",
      value: "test-region",
    });
    showQuickPickStub.onCall(1).resolves({
      value: "JS",
    });
    showQuickPickStub.onCall(2).resolves({
      value: "sample",
    });

    showOpenDialogStub.resolves([vscode.Uri.file(__filename)]);
    showInputBoxStub.onCall(1).resolves();

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(azureMCCFSetupStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);
    sinon.assert.notCalled(showMCCFInstanceDetailsStub);

    sinon.assert.calledTwice(showInputBoxStub);
    sinon.assert.calledThrice(showQuickPickStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "Please enter a valid member identifier",
    );
    sinon.assert.notCalled(showInformationMessageStub);
  });

  test("should fail when node count is not inserted", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    azureMCCFSetupStub.resolves();
    listResourceGroupsStub.resolves("testResourceGroup");

    showInputBoxStub.onCall(0).resolves("test-mccf-instance");
    showQuickPickStub.onCall(0).resolves({
      label: "region",
      value: "test-region",
    });
    showQuickPickStub.onCall(1).resolves({
      value: "JS",
    });
    showQuickPickStub.onCall(2).resolves({
      value: "sample",
    });

    showOpenDialogStub.resolves([vscode.Uri.file(__filename)]);
    showInputBoxStub.onCall(1).resolves("member0");
    showInputBoxStub.onCall(2).resolves();

    await createMCCFInstance();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(azureMCCFSetupStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);
    sinon.assert.notCalled(showMCCFInstanceDetailsStub);

    sinon.assert.calledThrice(showInputBoxStub);
    sinon.assert.calledThrice(showQuickPickStub);
    sinon.assert.calledOnce(showOpenDialogStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      "Please enter a valid positive integer for the number of nodes",
    );
    sinon.assert.notCalled(showInformationMessageStub);
  });
});
