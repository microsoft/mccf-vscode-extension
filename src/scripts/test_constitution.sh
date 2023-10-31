#!/bin/bash

set -euo pipefail

source common_utils.sh

init_env

function usage {
    echo ""
    echo "Start a local CCF network with the custom governance scripts."
    echo ""
    echo "usage: ./test_constitution.sh --network-url <network_url> --signing-cert <cert_path> --signing-key <key_path>"
    echo ""
    echo "  --network-url   string   CCF network url (example: https://test.confidential-ledger.azure.com)  "
    echo "  --signing-cert          string      The signing certificate.  "
    echo "  --signing-key           string      The signing key.  " 
    exit 0
}

# Test variables
PASS=0
FAIL=0
TEST=0
sc=0
rc=0
el=0

# Path variables
governance_dir="../governance"
workspace_dir="$governance_dir/workspace"
proposals_dir="$governance_dir/proposals"

mkdir -p $workspace_dir
cp -r $proposals_dir/* $workspace_dir

function initTest {
    TEST=$((TEST+1))
    sc=$(tput sc) rc=$(tput rc) el=$(tput el)
    echo && printf "[Test $TEST]: $1...%s" "$sc"
}

function getResult {
    local resp="$1"
    local testName="$2"

    local state
    state=$(echo "$resp" | jq -r '.state')
    if [ "$state" = "Accepted" ]; then
        echo "$(tput setaf 2)test $testName is successful$(tput sgr0)"
        PASS=$((PASS + 1))
    else
        echo "$(tput setaf 1)test $testName failed$(tput sgr0)"
        FAIL=$((FAIL + 1))
    fi
}

# parse parameters
if [ $# -eq 0 ]; then
    usage
    exit 1
fi

# parse parameters
#if [ $# -gt 3 ]; then
#    usage
#    exit 1
#fi

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

echo "$network_url, $signing_cert, $signing_key"

# Get service certificate
service_cert=""
get_ccf_service_cert "$network_url" service_cert
# Convert certificate_data to the json format
formatted_cert=$(echo -n "$service_cert" | sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/\\n/g')

##############################################
# transition_service_to_open
##############################################
initTest "Transition service to open"
transition_service='{
   "actions": [
    {
        "name": "transition_service_to_open",
        "args": {
          "next_service_identity":"'"$formatted_cert"'"
        }
    }]
}'

resp=$(ccf_cose_sign1 --content <(echo "$transition_service") --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "transition service to open"


##############################################
# transition_node_to_trusted
##############################################
initTest "Transition node to trusted"


##############################################
# set_js_app
##############################################
initTest "Submit an application bundle"
resp=$(ccf_cose_sign1 --content $workspace_dir/set_banking_app.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "submit an application bundle"

##############################################
# set_ca_cert_bundle
##############################################
initTest "Set CA cert bundle"
resp=$(ccf_cose_sign1 --content $workspace_dir/set_ca_cert_bundle.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "set CA cert bundle"

##############################################
# set_jwt_issuer
##############################################
initTest "Set jwt issuer"
resp=$(ccf_cose_sign1 --content $workspace_dir/set_jwt_issuer.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "set jwt issuer"

##############################################
# set_jwt_public_signing_keys
##############################################
initTest "Set jwt public signing keys"
resp=$(ccf_cose_sign1 --content $workspace_dir/set_jwt_public_signing_keys.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "set jwt public signing keys"

##############################################
# remove_jwt_issuer
##############################################
initTest "Remove jwt issuer"
resp=$(ccf_cose_sign1 --content $workspace_dir/remove_jwt_issuer.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "remove jwt issuer"

##############################################
# remove_ca_cert_bundle
##############################################
initTest "Remove CA cert bundle"
resp=$(ccf_cose_sign1 --content $workspace_dir/remove_ca_cert_bundle.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "remove CA cert bundle"

##############################################
# set_node_certificate_validity
##############################################
initTest "Set node certificate validity"
node_id=$(curl --silent --cacert <(echo "$service_cert") $network_url/node/network/nodes | jq -r '.nodes[] | select(.status=="Trusted") | .node_id' | head -1)
valid_from=$(date +%Y%m%d%H%M%SZ)
sed -i -e "s/__VALIDFROM__/$valid_from/" $workspace_dir/set_node_certificate_validity.json
sed -i -e "s/__NODEID__/$node_id/" $workspace_dir/set_node_certificate_validity.json
state=""
response_code=$(ccf_cose_sign1 --content $workspace_dir/set_node_certificate_validity.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") -o /dev/null --write-out '%{response_code}' $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
if [ $response_code -eq 200 ];
then
    state='{
        "state": "Accepted"
    }'
fi
getResult "$state" "set node certificate validity"

##############################################
# set_service_certificate_validity
##############################################
initTest "Set service certificate validity"
valid_from=$(date +%Y%m%d%H%M%SZ)
sed -i -e "s/__VALIDFROM__/$valid_from/" $workspace_dir/set_service_certificate_validity.json
state=""
response_code=$(ccf_cose_sign1 --content $workspace_dir/set_service_certificate_validity.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") -o /dev/null --write-out '%{response_code}' $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
if [ $response_code -eq 200 ];
then
    state='{
        "state": "Accepted"
    }'
fi
getResult "$state" "set service certificate validity"

##############################################
# set_user
##############################################
initTest "Set user"
resp=$(ccf_cose_sign1 --content $workspace_dir/set_user.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "set user"

##############################################
# set_user_data
##############################################
initTest "Set user data"
resp=$(ccf_cose_sign1 --content $workspace_dir/set_user_data.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "set user data"

##############################################
# trigger_snapshot
##############################################
initTest "Trigger snapshot"
resp=$(ccf_cose_sign1 --content $workspace_dir/trigger_snapshot.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "trigger snapshot"

##############################################
# trigger_ledger_chunk
##############################################
initTest "Trigger ledger chunk"
resp=$(ccf_cose_sign1 --content $workspace_dir/trigger_ledger_chunk.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "trigger ledger chunk"

##############################################
# add_node_code
##############################################
initTest "Add node code"
resp=$(ccf_cose_sign1 --content $workspace_dir/add_node_code.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "add node code"

##############################################
# remove_node_code
##############################################
initTest "Remove node code"
resp=$(ccf_cose_sign1 --content $workspace_dir/remove_node_code.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "remove node code"

##############################################
# set_member
##############################################
initTest "Set member"
resp=$(ccf_cose_sign1 --content $workspace_dir/set_member.json --signing-cert "$signing_cert" --signing-key "$signing_key" --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -Is` | curl --silent --cacert <(echo "$service_cert") $network_url/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
getResult "$resp" "set member"

echo && printf "Total tests:$TEST, Passed:$PASS, Failed:$FAIL, Test coverage:%.2f%%\n" "$(bc -l <<< "(($PASS/$TEST)*100)")"

# delete workspace directory
rm -r $workspace_dir

# Deactivate virtual environment
deactivate_env