#!/bin/bash

set -euo pipefail

source common_utils.sh

trap 'handle_error' EXIT
init_env

function usage {
    echo ""
    echo "Submit a CCF proposal."
    echo ""
    echo "usage: ./submit_proposal.sh --network-url string --signing-cert string --signing-key string --proposal-file string"
    echo ""
    echo "  --network-url           string      CCF network url (example: https://test.confidential-ledger.azure.com)"
    echo "  --signing-cert          string      The signing certificate for the proposal."
    echo "  --signing-key           string      The signing key for the proposal."
    echo "  --proposal-file         string      Path to any governance proposal to submit (example: dist/set_js_app.json)"
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
        --proposal_file) proposal_file="$2"; shift;;
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
elif [[ -z $proposal_file ]]; then
    failed "Missing parameter --proposal-file"
fi

# Get service certificate
service_cert=""
get_ccf_service_cert "$network_url" service_cert

# Activate member
activate_member "$network_url" "$signing_cert" "$signing_key"

echo "Submitting proposal..."

# Submit proposal
proposal_out=$(ccf_cose_sign1 --ccf-gov-msg-type proposal --ccf-gov-msg-created_at "$(date -Is)" --signing-key "$signing_key" --signing-cert "$signing_cert" --content "$proposal_file" | curl "$network_url/gov/proposals" --cacert <(echo "$service_cert") --data-binary @- --header "content-type: application/cose" --silent)
proposal_id=$( jq -r  '.proposal_id' <<< "${proposal_out}" )
echo "Proposal ID is: $proposal_id"

# Deactivate virtual environment
deactivate_env
