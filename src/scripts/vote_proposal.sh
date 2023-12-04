#!/bin/bash

set -euo pipefail

source common_utils.sh

trap 'handle_error' EXIT
init_env

function usage {
    echo ""
    echo "Send vote for a CCF proposal."
    echo ""
    echo "usage: ./vote_proposal.sh --network-url string --signing-cert string --signing-key string --proposal-id string --vote-file string"
    echo ""
    echo "  --network-url           string      CCF network url (example: https://test.confidential-ledger.azure.com)"
    echo "  --signing-cert          string      The signing certificate for the proposal."
    echo "  --signing-key           string      The signing key for the proposal."    
    echo "  --proposal-id           string      Id of the proposal to vote for"
    echo "  --proposal-file         string      Path to the vote json file (example: vote.json)"
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
        --proposal_id) proposal_id="$2"; shift;;
        --vote_file) vote_file="$2"; shift;;
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
elif [[ -z $proposal_id ]]; then
    failed "Missing parameter --proposal-id"
elif [[ -z $vote_file ]]; then
    failed "Missing parameter --vote-file"
fi

# Get service certificate
service_cert=""
get_ccf_service_cert "$network_url" service_cert

# Activate member
activate_member "$network_url" "$signing_cert" "$signing_key"

echo "Sending vote..."

# Member vote for proposal
ccf_cose_sign1 --ccf-gov-msg-type ballot --ccf-gov-msg-created_at "$(date -Is)" --ccf-gov-msg-proposal_id "$proposal_id" --signing-key "$signing_key" --signing-cert "$signing_cert" --content "$vote_file" | curl "$network_url/gov/proposals/$proposal_id/ballots" --cacert <(echo "$service_cert") --data-binary @- -H "content-type: application/cose" --silent

# Deactivate virtual environment
deactivate_env