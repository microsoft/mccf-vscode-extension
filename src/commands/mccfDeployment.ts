/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const { DefaultAzureCredential } = require("@azure/identity");
const { ResourceManagementClient } = require("@azure/arm-resources");
const readlineSync = require('readline-sync');

// Prompt the user for input
const subscriptionId = readlineSync.question("Enter the subscription ID: ");
const resourceGroupName = readlineSync.question("Enter the resource group name: ");
const location = readlineSync.question("Enter the location: ");
const mccfInstanceName = readlineSync.question("Enter the MCCF instance name: ");

 
const credential = new DefaultAzureCredential();
const resourceClient = new ResourceManagementClient(credential, subscriptionId);

async function createMCCFInstance() {
    // Define the MCCF instance parameters
    const mccfInstanceParams = {
      location: location,
      sku: {
        name: "Standard"
      },
      properties: {}
    };
  
    // Create the MCCF instance
    const mccfInstance = await resourceClient.resources.beginCreateOrUpdate(
      resourceGroupName,
      "Microsoft.Management/managementgroups",
      mccfInstanceName,
      {
        location: location,
        properties: {
          parentId: "/",
          tenantId: "<your-tenant-id>"
        }
      }
    );
  
    console.log("MCCF instance created:", mccfInstance);
  }
  
  createMCCFInstance().catch((error) => {
    console.error("Error occurred:", error);
  });
  



  /* Requires prompt-sync package VVVV (npm install prompt-sync)


  const { DefaultAzureCredential } = require("@azure/identity");
const { ResourceManagementClient } = require("@azure/arm-resources");
const prompt = require("prompt-sync")(); // Import the prompt-sync package

// Prompt the user for input
const subscriptionId = prompt("Enter the subscription ID: ");
const resourceGroupName = prompt("Enter the resource group name: ");
const location = prompt("Enter the location: ");
const mccfInstanceName = prompt("Enter the MCCF instance name: ");

const credential = new DefaultAzureCredential();
const resourceClient = new ResourceManagementClient(credential, subscriptionId);

async function createMCCFInstance() {
  // Define the MCCF instance parameters
  const mccfInstanceParams = {
    location: location,
    sku: {
      name: "Standard"
    },
    properties: {}
  };

  // Create the MCCF instance
  const mccfInstance = await resourceClient.resources.beginCreateOrUpdate(
    resourceGroupName,
    "Microsoft.Management/managementgroups",
    mccfInstanceName,
    {
      location: location,
      properties: {
        parentId: "/",
        tenantId: "<your-tenant-id>"
      }
    }
  );

  console.log("MCCF instance created:", mccfInstance);
}

createMCCFInstance().catch((error) => {
  console.error("Error occurred:", error);
});

*/ 