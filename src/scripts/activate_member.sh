#!/bin/bash

set -euo pipefail

source common_utils.sh

trap 'handle_error' EXIT
init_env

function usage {
    echo ""
    echo "Activate a CCF member."
    echo ""
    echo "usage: ./activate_member.sh --network-url string --signing-cert string --signing-key string"
    echo ""
    echo "  --network-url           string      CCF network url (example: https://test.confidential-ledger.azure.com)"
    echo "  --signing-cert          string      The signing certificate of the member."
    echo "  --signing-key           string      The signing key of the member."
    echo ""
    exit 0
}

# parse parameters
if [ $# -eq 0 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    name="${1/--/}"
    name="${name/-/_}"
    case "--$name"  in
        --network_url) network_url="$2"; shift;;
        --signing_cert) signing_cert="$2"; shift;;
        --signing_key) signing_key="$2"; shift;;
        --help) usage; exit 0; shift;;
        --) shift;;
    esac
    shift;
done

# validate parameters
if [[ -z $network_url ]]; then
    failed "Missing parameter --network-url"
elif [[ -z $signing_cert ]]; then
   failed "You must supply --signing-cert"
elif [[ -z $signing_key ]]; then
   failed "You must supply --signing-key"
fi

# Activate member
activate_member "$network_url" "$signing_cert" "$signing_key"

# Deactivate virtual environment
deactivate_env
