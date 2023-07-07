#!/bin/bash

set -euo pipefail

VIRTUAL_ENVIRONMENT_NAME="./env/extensionenv"
CCF_VERSION="4.0.2"

# Initialize environment
function init_env() {

    echo "Initializing environment..."

    # Create virtual environment
    python3 -m venv $VIRTUAL_ENVIRONMENT_NAME || { echo "Failed to create virtual environment"; exit 1; }

    # Activate virtual environment
    source $VIRTUAL_ENVIRONMENT_NAME/bin/activate

    # Install ccf package
    pip install ccf==$CCF_VERSION > /dev/null || { echo "Failed to install ccf package"; exit 1; }
}

# Deactivate virtual environment
function deactivate_env() {
    deactivate
}

# Get service certificate from a CCF network
# Note: this is using a an unverified HTTPS connection
function get_ccf_service_cert() {

    local network_url=$1
    local -n network_cert=$2

    # Ping /node/network endpoint and extract the network certificate from the response 
    network_cert=$(curl "$network_url"/node/network -k --silent -m 10 | jq -r '.service_certificate')

    # Check if network certificate is empty
    if [[ -z $network_cert ]]; then
        failed "Failed to get network certificate"
    fi
}

# Activate a member
function activate_member() {

    local network_url=$1
    local signing_cert=$2
    local signing_key=$3

    # Get service certificate
    local service_cert=""
    get_ccf_service_cert "$network_url" service_cert

    # Get member id
    member_id=$(openssl x509 -in "$signing_cert" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

    # Get member status
    member_status=$(curl "$network_url"/gov/members --cacert <(echo "$service_cert") --silent | jq -r --arg member_id "$member_id" '.[$member_id].status')

    # Activate member if not active
    if [[ "$member_status" != "Active" ]]; then

        # Get state digest
        request_json=$(curl "$network_url"/gov/ack/update_state_digest -X POST --cacert <(echo "$service_cert") --key "$signing_key" --cert "$signing_cert" --silent)
        
        # Ack state digest
        ccf_cose_sign1 --ccf-gov-msg-type ack --ccf-gov-msg-created_at "$(date -Is)" --signing-key "$signing_key" --signing-cert "$signing_cert" --content <(echo "$request_json") | curl "$network_url"/gov/ack --cacert <(echo "$service_cert") --header "Content-Type: application/cose" --data-binary @- --silent
    fi
}

# Function to print failure message and exit
function failed {
    printf "Script failed: %s\n\n" "$1"
    exit 1
}