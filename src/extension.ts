const { DefaultAzureCredential } = require("@azure/identity");
const { ResourceManagementClient } = require("@azure/arm-resources");
const readlineSync = require('readline-sync');

export async function createMCCFInstance() {
    try {
        // Prompt the user for input
        const subscriptionId = readlineSync.question("Enter the subscription ID: ");
        const resourceGroupName = readlineSync.question("Enter the resource group name: ");
        const location = readlineSync.question("Enter the location: ");
        const mccfInstanceName = readlineSync.question("Enter the MCCF instance name: ");

        const credential = new DefaultAzureCredential();
        const resourceClient = new ResourceManagementClient(credential, subscriptionId);

        // Define the MCCF instance parameters
        const mccfInstanceParams = {
            location: location,
            sku: {
                name: "Standard"
            },
            properties: {
                parentId: "/",
                tenantId: "<your-tenant-id>"
            }
        };

        // Create the MCCF instance
        const mccfInstance = await resourceClient.resources.beginCreateOrUpdate(
            resourceGroupName,
            "Microsoft.Management/managementGroupSubscriptions",
            mccfInstanceName,
            mccfInstanceParams
        ).awaitCompletion();  // Wait for the operation to complete

        console.log("MCCF instance created:", mccfInstance);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}