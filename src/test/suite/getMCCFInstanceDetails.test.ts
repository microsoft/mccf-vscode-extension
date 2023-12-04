// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getMCCFInstanceDetails } from "../../commands/getMCCFInstanceDetails";
import * as utility from "../../Utilities/azureUtilities";
import * as errorUtils from "../../Utilities/errorUtils";
import * as ledgerClient from "@azure/arm-confidentialledger";

const ccfResource = [
  {
    properties: {
      appName: "testApp",
      appUri: "testAppUri",
      deploymentType: {
        languageRuntime: "JS",
      },
      nodeCount: 3,
    },
  },
];

suite("Get MCCF Instance Details integration tests", () => {
  let sandbox: sinon.SinonSandbox;
  let listSubscriptionsStub: sinon.SinonStub;
  let listResourceGroupsStub: sinon.SinonStub;
  let ledgerClientStub: sinon.SinonStub;
  let listStub: sinon.SinonStub;
  let logAndDisplayErrorStub: sinon.SinonStub;

  let showDetailsStub: sinon.SinonStub;
  let showQuickPickStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    listSubscriptionsStub = sandbox.stub(utility, "listSubscriptions");
    listResourceGroupsStub = sandbox.stub(utility, "listResourceGroups");
    ledgerClientStub = sandbox.stub(ledgerClient, "ConfidentialLedgerClient");
    listStub = sandbox.stub();
    logAndDisplayErrorStub = sandbox.stub(errorUtils, "logAndDisplayError");

    showDetailsStub = sandbox.stub(utility, "showMCCFInstanceDetails");
    showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick");
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
    listResourceGroupsStub.resolves("testResourceGroup");
    listStub.resolves(ccfResource);

    ledgerClientStub.returns({
      managedCCFOperations: {
        listByResourceGroup: listStub,
      },
    });

    showQuickPickStub.resolves("testApp");

    await getMCCFInstanceDetails();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.calledOnce(ledgerClientStub);
    sinon.assert.calledOnce(listStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.notCalled(showInformationMessageStub);
    sinon.assert.calledOnce(showQuickPickStub);
    sinon.assert.calledWith(
      showDetailsStub,
      "testApp",
      "testresourcegroup",
      "testSubscription",
    );
  });

  test("should fail when listSubscriptions returns an error", async () => {
    // Mock user input and external functions
    const err = new Error("test error message");
    listSubscriptionsStub.rejects(err);

    await getMCCFInstanceDetails();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.notCalled(listResourceGroupsStub);
    sinon.assert.notCalled(ledgerClientStub);
    sinon.assert.notCalled(listStub);

    sinon.assert.calledWith(
      logAndDisplayErrorStub,
      "Failed to list MCCF instances",
      err,
    );

    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.notCalled(showDetailsStub);
    sinon.assert.notCalled(showInformationMessageStub);
    sinon.assert.notCalled(showQuickPickStub);
  });

  test("should fail when listResourceGroups returns an error", async () => {
    // Mock user input and external functions
    const err = new Error("test error message");
    listSubscriptionsStub.resolves("testSubscription");
    listResourceGroupsStub.rejects(err);

    await getMCCFInstanceDetails();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.notCalled(ledgerClientStub);
    sinon.assert.notCalled(listStub);

    sinon.assert.calledWith(
      logAndDisplayErrorStub,
      "Failed to list MCCF instances",
      err,
    );

    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.notCalled(showDetailsStub);
    sinon.assert.notCalled(showInformationMessageStub);
    sinon.assert.notCalled(showQuickPickStub);
  });

  test("should fail when listByResourceGroup returns an error", async () => {
    // Mock user input and external functions
    const err = new Error("test error message");
    listSubscriptionsStub.resolves("testSubscription");
    listResourceGroupsStub.resolves("testResourceGroup");
    listStub.rejects(err);

    ledgerClientStub.returns({
      managedCCFOperations: {
        listByResourceGroup: listStub,
      },
    });

    await getMCCFInstanceDetails();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.calledOnce(ledgerClientStub);
    sinon.assert.calledOnce(listStub);

    sinon.assert.calledWith(
      logAndDisplayErrorStub,
      "Failed to list MCCF instances",
    );

    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.notCalled(showDetailsStub);
    sinon.assert.notCalled(showInformationMessageStub);
    sinon.assert.notCalled(showQuickPickStub);
  });

  test("should fail when no instance is returned", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    listResourceGroupsStub.resolves("testResourceGroup");
    listStub.resolves([]);

    ledgerClientStub.returns({
      managedCCFOperations: {
        listByResourceGroup: listStub,
      },
    });

    await getMCCFInstanceDetails();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.calledOnce(ledgerClientStub);
    sinon.assert.calledOnce(listStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.notCalled(showErrorMessageStub);
    sinon.assert.calledWith(
      showInformationMessageStub,
      "No MCCF instances found in the selected subscription and resource group",
    );
    sinon.assert.notCalled(showQuickPickStub);
    sinon.assert.notCalled(showDetailsStub);
  });

  test("should fail when no instance is selected", async () => {
    // Mock user input and external functions
    listSubscriptionsStub.resolves("testSubscription");
    listResourceGroupsStub.resolves("testResourceGroup");
    listStub.resolves(ccfResource);

    ledgerClientStub.returns({
      managedCCFOperations: {
        listByResourceGroup: listStub,
      },
    });

    showQuickPickStub.resolves();

    await getMCCFInstanceDetails();

    sinon.assert.calledOnce(listSubscriptionsStub);
    sinon.assert.calledOnce(listResourceGroupsStub);
    sinon.assert.calledOnce(ledgerClientStub);
    sinon.assert.calledOnce(listStub);
    sinon.assert.notCalled(logAndDisplayErrorStub);

    sinon.assert.calledWith(showErrorMessageStub, "No MCCF instance selected");
    sinon.assert.notCalled(showInformationMessageStub);
    sinon.assert.calledOnce(showQuickPickStub);
    sinon.assert.notCalled(showDetailsStub);
  });
});
