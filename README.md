# MCCF VSCode Extension

This Visual Studio Code extension for [Managed CCF](https://techcommunity.microsoft.com/t5/azure-confidential-computing/microsoft-introduces-preview-of-azure-managed-confidential/ba-p/3648986) simplifies and enhances the development experience. With this extension, users can seamlessly create, test, manage, and deploy their CCF applications directly within Visual Studio Code. By eliminating the need for external tools and [documentation](https://microsoft.github.io/CCF/main/build_apps/get_started.html), user workflow is faster and more efficient for Managed CCF customers.

Use MCCF functions to quickly create the development environment with all necessary dependencies with templating, and easily test and deploy CCF applications to Managed CCF instances in Azure. All of these features combined enables users to build **confidential multi-party applications** with **customizable governance** and **auditability**.

## Create your CCF Application

1. To start your project, first set up the self-contained development environment

![This photo displays the choice of commands appearing to the user with the MCCF: Create CCF App Environment in DevContainer as the option highlighted with a red outline and should be chosen first by the user.](images/first_commandView.png)

2.  Next, select the template you would like to begin building your project from. You can choose from 3 different options, a generic template, a sample banking app, or a custom project given you have the github repository link

![Here there are 3 options displayed that appear after choosing to create a CCF app environment. The options are: Standard CCF Template where the user can create a CCF application from a generic template; a Sample Banking app, a specific sample template; or the option to create a custom project where the developer can create a CCF application from a custom github repository link](images/choose_template.png)

3. After choosing your template, the application will open in a development container with all of the necessary dependencies where the app will be ready for network initialization
   > The feature allows users to run and build CCF app in its development container with ease. Users are able to choose between already existing CCF apps' templates that already have the files and dependencies installed

## Start a CCF Network

Activate a network with one node and member to start a network all from docker **OR** the devcontainer. The option is left to users as it allows non-devconatiner users to start a CCF network on their local environment

### Start Network in DevContainer

1. Upon starting the network in a DevContainer, you will be given the option to choose a project folder. Make sure that you are in the root folder of your project workspace (for example workspace/ccf-app-template)![Alt text](image.png)

2. You should see something similar to the following output generating in the terminal. This is how you will know your network has been successfully set up:

```bash
[22:07:02.315] Virtual mode enabled
[22:07:02.316] Starting 1 CCF node...
[22:07:06.167] Started CCF network with the following nodes:
[22:07:06.168]   Node [0] = https://127.0.0.1:8000
[22:07:06.168] You can now issue business transactions to the libjs_generic application
[22:07:06.168] Loaded JS application: /workspaces/ccf-app-template/dist/
[22:07:06.168] Keys and certificates have been copied to the common folder: /workspaces/ccf-app-template/workspace/sandbox_common
[22:07:06.168] See https://microsoft.github.io/CCF/main/use_apps/issue_commands.html for more information
[22:07:06.168] Press Ctrl+C to shutdown the network
```

### Start Network in Docker Container

1. To build a runtime image of the JavaScript application via docker, you will get the option to "Select Dockerfile." Select the file in the path: /workspaces/{your-chosen-template}/docker/ccf_app_js.virtual
   ![Alt text](image-1.png)

2. When choosing project folder, ensure that you are in the root folder of your project workspace: ![Alt text](image.png)

After starting the network in a Docker Container, your output should look similar to the following output:

![Alt text](image-2.png)

> TIP: Always double check your current directory selection. If you're not in the right place, these commands may not execute as expected

## Submit a Proposal
1. In order to submit a proposal you would need to provide four parameters which are the network url,signing key,certificate key and the proposal file. Choose the correct the correct file format as the signing and certificate keys are **PEM** files while proposals are **JSON** files.

2. Once provided a new proposal can be submitted. Additional members can vote on the proposal using a proposal ID.
