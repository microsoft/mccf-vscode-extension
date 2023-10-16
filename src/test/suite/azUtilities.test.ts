import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as sinon from "sinon";
import * as subscriptionClient from "@azure/arm-subscriptions";
import * as resourceClient from "@azure/arm-resources";
import * as ledgerClient from "@azure/arm-confidentialledger";
import * as extensionUtils from "../../Utilities/extensionUtils";
import {
  listResourceGroups,
  listSubscriptions,
  showMCCFInstanceDetails,
  createInstance,
} from "../../Utilities/azureUtilities";

suite("Azure list subscription tests", () => {
  let subscriptionClientStub: sinon.SinonStub;
  let showQuickPickStub: sinon.SinonStub; 
  const displayList = ['test1', 'test2', 'test3'];
  const subscriptionList = ['subscription1', 'subscription2', 'subscription3'];
  
  teardown(() => {
    // Restore the original behavior after each test
    subscriptionClientStub.restore();
    showQuickPickStub.restore();
  });

  test("success behaviour", async () => {
    // Define the behavior of the stubbed method
    subscriptionClientStub = sinon.stub(subscriptionClient, "SubscriptionClient");
    const listStub = sinon.stub();
    listStub.resolves([
      {
        displayName: displayList[0],
        subscriptionId: subscriptionList[0],
      },
      {
        displayName: displayList[1],
        subscriptionId: subscriptionList[1],
      }
    ]);

    subscriptionClientStub.returns({
      subscriptions: {
        list: listStub,
      },
    });

    showQuickPickStub = sinon.stub(vscode.window, "showQuickPick");
    showQuickPickStub.resolves({
      label: displayList[0],
      description: subscriptionList[0],
    });

    const result = await listSubscriptions();
    assert.equal(result, subscriptionList[0], "selected subscription is not equal to expected subscription");
    sinon.assert.calledOnce(subscriptionClientStub);
    sinon.assert.calledOnce(listStub);
    sinon.assert.calledOnce(showQuickPickStub);
  });

  test("should fail when the list result is empty", async () => {
    // Define the behavior of the stubbed method
    subscriptionClientStub = sinon.stub(subscriptionClient, "SubscriptionClient");
    const listStub = sinon.stub();

    // set the return array to be a null list
    listStub.resolves([]);

    subscriptionClientStub.returns({
      subscriptions: {
        list: listStub,
      },
    });

    showQuickPickStub = sinon.stub(vscode.window, "showQuickPick");
    showQuickPickStub.resolves({
      label: displayList[0],
      description: subscriptionList[0],
    });

    let error;
    try {
      await listSubscriptions();
    } catch (err : any) {
      error = err;
    }

    sinon.assert.calledOnce(subscriptionClientStub);
    sinon.assert.calledOnce(listStub);
    sinon.assert.notCalled(showQuickPickStub);
    assert.equal(error.message, "Failed to list subscriptions: No subscription found", "error message is not equal to expected error message");
  });

  test("should fail when the subscription is not selected", async () => {
    // Define the behavior of the stubbed method
    subscriptionClientStub = sinon.stub(subscriptionClient, "SubscriptionClient");
    const listStub = sinon.stub();

    // set the return array to be a null list
    listStub.resolves([
      {
        displayName: displayList[0],
        subscriptionId: subscriptionList[0],
      },
      {
        displayName: displayList[1],
        subscriptionId: subscriptionList[1],
      }
    ]);

    subscriptionClientStub.returns({
      subscriptions: {
        list: listStub,
      },
    });

    showQuickPickStub = sinon.stub(vscode.window, "showQuickPick");
    showQuickPickStub.resolves();

    let error;
    try {
      await listSubscriptions();
    } catch (err : any) {
      error = err;
    }

    sinon.assert.calledOnce(subscriptionClientStub);
    sinon.assert.calledOnce(listStub);
    sinon.assert.calledOnce(showQuickPickStub);
    assert.equal(error.message, "Failed to list subscriptions: No subscription selected", "error message is not equal to expected error message");
  });
});

suite("Azure list resource groups tests", () => {
  let resourceClientStub: sinon.SinonStub;
  let showQuickPickStub: sinon.SinonStub; 
  const resourceList = ['resourceGroup1', 'resourceGroup2'];
  
  teardown(() => {
    // Restore the original behavior after each test
    resourceClientStub.restore();
    showQuickPickStub.restore();
  });

  test("success behaviour", async () => {
    // Define the behavior of the stubbed method
    resourceClientStub = sinon.stub(resourceClient, "ResourceManagementClient");
    const listStub = sinon.stub();
    listStub.resolves([
      {
        name: resourceList[0],
      },
      {
        name: resourceList[1],
      }
    ]);

    resourceClientStub.returns({
      resourceGroups: {
        list: listStub,
      },
    });

    showQuickPickStub = sinon.stub(vscode.window, "showQuickPick");
    showQuickPickStub.resolves({
      label: resourceList[0],
    });

    const result = await listResourceGroups("testSubscription");
    assert.equal(result.label, resourceList[0], "selected resource group is not equal to expected resource group");
    sinon.assert.calledOnce(resourceClientStub);
    sinon.assert.calledOnce(listStub);
    sinon.assert.calledOnce(showQuickPickStub);
  });

  test("should fail when the list result is empty", async () => {
    // Define the behavior of the stubbed method
    resourceClientStub = sinon.stub(resourceClient, "ResourceManagementClient");
    const listStub = sinon.stub();
    listStub.resolves([]);

    resourceClientStub.returns({
      resourceGroups: {
        list: listStub,
      },
    });

    showQuickPickStub = sinon.stub(vscode.window, "showQuickPick");
    showQuickPickStub.resolves({
      label: resourceList[0],
    });

    let error;
    try {
      await listResourceGroups("testSubscription");
    } catch (err : any) {
      error = err;
    }
    
    sinon.assert.calledOnce(resourceClientStub);
    sinon.assert.calledOnce(listStub);
    sinon.assert.notCalled(showQuickPickStub);
    assert.equal(error.message, "Failed to list resource groups: No resource group found", "error message is not equal to expected error message");
  });

  test("should fail when the resource group is not selected", async () => {
    // Define the behavior of the stubbed method
    resourceClientStub = sinon.stub(resourceClient, "ResourceManagementClient");
    const listStub = sinon.stub();
    listStub.resolves([
      {
        name: resourceList[0],
      },
      {
        name: resourceList[1],
      }
    ]);

    resourceClientStub.returns({
      resourceGroups: {
        list: listStub,
      },
    });

    showQuickPickStub = sinon.stub(vscode.window, "showQuickPick");
    showQuickPickStub.resolves();

    let error;
    try {
      await listResourceGroups("testSubscription");
    } catch (err : any) {
      error = err;
    }
    
    sinon.assert.calledOnce(resourceClientStub);
    sinon.assert.calledOnce(listStub);
    sinon.assert.calledOnce(showQuickPickStub);
    assert.equal(error.message, "Failed to list resource groups: No resource group selected", "error message is not equal to expected error message");
  });
});

suite("Azure show MCCF Instance tests", () => {
  let ledgerClientStub: sinon.SinonStub;
  let extensionStub: sinon.SinonStub;

  teardown(() => {
    // Restore the original behavior after each test
    ledgerClientStub.restore();
    extensionStub.restore();
  });

  test("success behaviour", async () => {
    // Define the behavior of the stubbed method
    ledgerClientStub = sinon.stub(ledgerClient, "ConfidentialLedgerClient");
    const getStub = sinon.stub();

    const ccfResource = {
      properties: {
        appName: "testApp",
        appUri: "testAppUri",
        deploymentType: {
          languageRuntime: "JS",
        },
        nodeCount: 3,
      }
    }
    getStub.resolves(ccfResource);

    ledgerClientStub.returns({
      managedCCFOperations: {
        get: getStub,
      },
    });

    const mccfInstanceDetailsJson = JSON.stringify(
      ccfResource,
      null,
      2,
    );

    extensionStub = sinon.stub(extensionUtils, "showOutputInChannel");
    extensionStub.resolves(
      "MCCF instance view - testApp" + "\n" + mccfInstanceDetailsJson
    );

    await showMCCFInstanceDetails("testApp", "testResourceGroup", "testSubscription");
    sinon.assert.calledOnce(ledgerClientStub);
    sinon.assert.calledOnce(getStub);
    sinon.assert.calledOnce(extensionStub);
  });

  test("success behaviour", async () => {
    // Define the behavior of the stubbed method
    ledgerClientStub = sinon.stub(ledgerClient, "ConfidentialLedgerClient");
    const getStub = sinon.stub();

    const ccfResource = {
      properties: {
        appName: "testApp",
        appUri: "testAppUri",
        deploymentType: {
          languageRuntime: "JS",
        },
        nodeCount: 3,
      }
    }
    getStub.rejects(new Error('test error message'));

    ledgerClientStub.returns({
      managedCCFOperations: {
        get: getStub,
      },
    });

    extensionStub = sinon.stub(extensionUtils, "showOutputInChannel");
    extensionStub.resolves(
      "test",
    );

    let error;
    try {
      await showMCCFInstanceDetails("testApp", "testResourceGroup", "testSubscription");
    } catch (err : any) {
      error = err;
    }

    assert.equal(error.message, "Failed to get MCCF instance details: Failed to execute task: test error message", "error message is not equal to expected error message");
    sinon.assert.calledOnce(ledgerClientStub);
    sinon.assert.calledOnce(getStub);
    sinon.assert.notCalled(extensionStub);
  });
});

suite("Azure create MCCF Instance tests", () => {
  let ledgerClientStub: sinon.SinonStub;

  teardown(() => {
    // Restore the original behavior after each test
    ledgerClientStub.restore();
  });
  
  test("success behaviour", async () => {
    // Define the behavior of the stubbed method
    ledgerClientStub = sinon.stub(ledgerClient, "ConfidentialLedgerClient");
    const createStub = sinon.stub();

    const ccfResource = {
      properties: {
        appName: "testApp",
        appUri: "testAppUri",
        deploymentType: {
          languageRuntime: "JS",
        },
        nodeCount: 3,
      }
    }
    createStub.resolves(ccfResource);

    ledgerClientStub.returns({
      managedCCFOperations: {
        beginCreateAndWait: createStub,
      },
    });

    await createInstance("eastUS", "custom", "JS", "testCert", "testSubscription", "testResourceGroup", "testApp", 3);
    sinon.assert.calledOnce(ledgerClientStub);
    sinon.assert.calledOnce(createStub);
  });

  test("should fail when the beginCreateAndWait is not successful", async () => {
    // Define the behavior of the stubbed method
    ledgerClientStub = sinon.stub(ledgerClient, "ConfidentialLedgerClient");
    const createStub = sinon.stub();

    createStub.rejects(new Error("test error"));

    ledgerClientStub.returns({
      managedCCFOperations: {
        beginCreateAndWait: createStub,
      },
    });

    let error;
    try {
      await createInstance("eastUS", "custom", "JS", "testCert", "testSubscription", "testResourceGroup", "testApp", 3);
    } catch (err : any) {
      error = err;
    }

    sinon.assert.calledOnce(ledgerClientStub);
    sinon.assert.calledOnce(createStub);
    assert.equal(error.message, "Failed to create MCCF instance: test error", "error message is not equal to expected error message");
  });
});
