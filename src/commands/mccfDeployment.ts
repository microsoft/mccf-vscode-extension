/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const { DefaultAzureCredential } = require("@azure/identity");
const { ResourceManagementClient } = require("@azure/arm-resources");
//TEST MCCF SUBSCRIPTION KEY
const subscriptionId = "027da7f8-2fc6-46d4-9be9-560706b60fec";
const resourceGroupName = "<resource-group-name>";
const location = "<location>";
const mccfInstanceName = "<mccf-instance-name>";

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
  