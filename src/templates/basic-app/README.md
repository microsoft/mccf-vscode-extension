# CCF App Template [![Open in VSCode](https://img.shields.io/static/v1?label=Open+in&message=VSCode&logo=visualstudiocode&color=007ACC&logoColor=007ACC&labelColor=2C2C32)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/andpiccione/ccf-app-template)

Template repository for JavaScript CCF applications.

## Quickstart

The quickest way to build and run this sample CCF app is to checkout this repository locally in its development container by clicking: 
[![Open in VSCode](https://img.shields.io/static/v1?label=Open+in&message=VSCode&logo=visualstudiocode&color=007ACC&logoColor=007ACC&labelColor=2C2C32)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/andpiccione/ccf-app-template)

All dependencies will be automatically installed (takes ~2 mins on first checkout).

Alternatively, you can checkout this repository in a Github codespace: [![Open in Github codespace](https://img.shields.io/static/v1?label=Open+in&message=GitHub+codespace&logo=github&color=2F363D&logoColor=white&labelColor=2C2C32)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=496290904&machine=basicLinux32gb&devcontainer_path=.devcontainer.json&location=WestEurope)

## <img src="https://user-images.githubusercontent.com/42961061/191275583-88e00f94-73aa-4d66-9786-047987eb9fa9.png" height=50px> </img> JavaScript

CCF apps can be written in JavaScript/TypeScript. This is the quickest way to develop new apps as this does not require any compilation step and the app can be updated on the fly, via [a governance proposal](https://microsoft.github.io/CCF/main/build_apps/js_app_bundle.html#deployment).

### Run JS app

```bash
$ npm --prefix . install
$ npm --prefix . run build
$ /opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./dist/
[12:00:00.000] Virtual mode enabled
[12:00:00.000] Starting 1 CCF node...
[12:00:00.000] Started CCF network with the following nodes:
[12:00:00.000]   Node [0] = https://127.0.0.1:8000
[12:00:00.000] You can now issue business transactions to the libjs_generic application
[12:00:00.000] Loaded JS application: ./dist/
[12:00:00.000] Keys and certificates have been copied to the common folder: /workspaces/ccf-app-template/workspace/sandbox_common
[12:00:00.000] See https://microsoft.github.io/CCF/main/use_apps/issue_commands.html for more information
[12:00:00.000] Press Ctrl+C to shutdown the network
```

In another terminal:

```bash
$ curl -X POST https://127.0.0.1:8000/app/log?id=1 --cacert ./workspace/sandbox_common/service_cert.pem -H "Content-Type: application/json" --data '{"msg": "hello world"}'
$ curl https://127.0.0.1:8000/app/log?id=1 --cacert ./workspace/sandbox_common/service_cert.pem
hello world
```

### Docker

It is possible to build a runtime image of the JavaScript application via docker:

```bash
$ docker build -t ccf-app-template:js-enclave -f docker/ccf_app_js.enclave .
$ docker run --device /dev/sgx_enclave:/dev/sgx_enclave --device /dev/sgx_provision:/dev/sgx_provision -v /dev/sgx:/dev/sgx ccf-app-template:js-enclave
...
2022-01-01T12:00:00.000000Z -0.000 0   [info ] ../src/node/node_state.h:1790        | Network TLS connections now accepted

# Now the CCF service is started and member governance is needed to allow trusted users to interact with the deployed application
```

Or, for the non-SGX (a.k.a. virtual) variant:

```bash
$ docker build -t ccf-app-template:js-virtual -f docker/ccf_app_js.virtual .
$ docker run ccf-app-template:js-virtual
```

#### Network governance

The CCF network is started with one node and one member, you need to execute the following governance steps to initialize the network

- [Activate the network existing member to start a network governance](https://microsoft.github.io/CCF/main/governance/adding_member.html#activating-a-new-member)
- Build the application and [create a deployment proposal](https://microsoft.github.io/CCF/main/build_apps/js_app_bundle.html#deployment)
- Deploy the application proposal, [using governance calls](https://microsoft.github.io/CCF/main/governance/proposals.html#submitting-a-new-proposal)
- Create and submit [an add users proposal](https://microsoft.github.io/CCF/main/governance/open_network.html#adding-users)
- Open the network for users ([using proposal](https://microsoft.github.io/CCF/main/governance/open_network.html#opening-the-network))

### Bare VM

The application can be tested using `cchost` on Linux environment.
To start a test CCF network on a Linux environment, it requires [CCF to be intalled](https://microsoft.github.io/CCF/main/build_apps/install_bin.html) or you can create a CCF-enabled VM using [Creating a Virtual Machine in Azure to run CCF](https://github.com/microsoft/CCF/blob/main/getting_started/azure_vm/README.md)

```bash
# Start the CCF network using the cchost in

# Enclave mode
 /opt/ccf/bin/cchost --config ./configs/cchost/cchost_config_enclave_js.json

# Or Virtual mode
/opt/ccf/bin/cchost --config ./configs/cchost/cchost_config_virtual_js.json
...

 # Now the CCF network is started and further initialization needed before the interaction with the service
```

The CCF network is started with one node and one member, please follow the [same governance steps as Docker](#network-governance) to initialize the network and check [CCF node config file documentation](https://microsoft.github.io/CCF/main/operations/configuration.html)


### Managed CCF

The application can be tested using [Azure Managed CCF](https://techcommunity.microsoft.com/t5/azure-confidential-computing/microsoft-introduces-preview-of-azure-managed-confidential/ba-p/3648986) ``(Pre-release phase)``, you can create Azure Managed CCF serivce on your subscription, that will give you a ready CCF network

- First, create the network's initial member certificate, please check [Certificates generation](https://microsoft.github.io/CCF/main/governance/adding_member.html)
- Create a new Azure Managed CCF serivce (the initial member certificate required as input)
- Build the application and [create a deployment proposal](https://microsoft.github.io/CCF/main/build_apps/js_app_bundle.html#deployment)
- Deploy the application proposal, [using governance calls](https://microsoft.github.io/CCF/main/governance/proposals.html#creating-a-proposal)
- Create and submit [an add users proposal](https://microsoft.github.io/CCF/main/governance/proposals.html#creating-a-proposal)
