#!/bin/bash
trap cleanup EXIT

set -euo pipefail

source common_utils.sh

init_env

declare certificate_dir=$(mktemp -d) # application folder for reference
echo "Created certificate directory at $certificate_dir"
declare signing_cert=""
declare signing_key=""
declare server=""
declare ext_dir=""
declare proposals_dir=""

# Format variables
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
DEFAULT=$(tput sgr0)

# Test variables
declare PASS=0
declare FAIL=0
declare TEST=0
declare sc=0
declare rc=0
declare el=0

# Helper functions
function usage {
    echo ""
    echo "Run a few tests to validate if the operator actions are allowed in the custom constitution."
    echo ""
    echo "usage: ./test_operator_actions.sh --address <IPADDRESS:PORT> --signing-cert <CERT> --signing-key <KEY> --ext-dir <extension directory>"
    echo ""
    echo "  --address       string      The address of the primary CCF node"
    echo "  --signing-cert  string      The signing certificate (member0)"
    echo "  --signing-key   string      The signing key (member0)"
    echo "  --ext-dir string      The directory where the extension is run from"
    echo ""
}

function failed {
    echo && printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

function cleanup {
    rm -rf $certificate_dir
}

function checkState {
    state=$1
    rc=$2
    el=$3
    if [ $state != "Accepted" ]; then
        printf "%s${RED}FAILED${DEFAULT}%s\n" "$rc" "$el"
        FAIL=$((FAIL + 1))
    else
        printf "%s${GREEN}PASSED${DEFAULT}%s\n" "$rc" "$el"
        PASS=$((PASS + 1))
    fi
}

function initTest {
    TEST=$((TEST+1))
    sc=$(tput sc) rc=$(tput rc) el=$(tput el)
    echo && printf "[Test $TEST]: $1...%s" "$sc"
}

# parse parameters
if [ $# -ne 8 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    case "$1" in
        --address) address="$2"; shift 2;;
        --signing-cert) signing_cert="$2"; shift 2;;
        --signing-key) signing_key="$2"; shift 2;;
        --ext-dir) ext_dir="$2"; shift 2;;
        --help) usage; exit 0;;

        *) usage; exit 1;;
    esac
done

# validate parameters
if [ -z "${signing_cert}" ]; then
    failed "You must supply --signing-cert"
fi
if [ -z "${signing_key}" ]; then
    failed "You must supply --signing-key"
fi
if [ -z "$address" ]; then
    failed "You must supply --address"
fi
if [ -z "$ext_dir" ]; then
    failed "You must supply --ext-dir"
fi

server="${address}"
proposals_dir="${ext_dir}/dist/templates/shared-template/samples/proposals"

#####################################################
# Download the service certificate
#####################################################
# The node is not up yet and the certificate will not be created until it
# return 200. We can't pass in the ca_cert hence why we use -k
while [ "200" != "$(curl "$server/node/network" -k -s -o /dev/null -w %{http_code})" ]
do
    sleep 1
done

mkdir -p "${certificate_dir}" 1>/dev/null 2>&1
curl "$server/node/network" -k --silent | jq -r .service_certificate > "${certificate_dir}/service_cert.pem"

# Convert string with \n into file with new lines
cp ${signing_cert} "${certificate_dir}/member0_cert.pem" 2>/dev/null
cp ${signing_key} "${certificate_dir}/member0_privk.pem" 2>/dev/null

##############################################
# transition_service_to_open
##############################################
initTest "Transition service to open"
service_cert=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}'  $certificate_dir/service_cert.pem)

cat > $proposals_dir/transition_service_to_open.json <<EOF
{
   "actions": [
    {
        "name": "transition_service_to_open",
        "args": {
          "next_service_identity":"$service_cert"
        }
      }
    ]
}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/transition_service_to_open.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_ca_cert_bundle
##############################################
initTest "Set CA cert bundle"
state=$(ccf_cose_sign1 --content $proposals_dir/set_ca_cert_bundle.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_jwt_issuer
##############################################
initTest "Set jwt issuer"
state=$(ccf_cose_sign1 --content $proposals_dir/set_jwt_issuer.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_jwt_public_signing_keys
##############################################
initTest "Set jwt public signing keys"
state=$(ccf_cose_sign1 --content $proposals_dir/set_jwt_public_signing_keys.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# remove_jwt_issuer
##############################################
initTest "Remove jwt issuer"
state=$(ccf_cose_sign1 --content $proposals_dir/remove_jwt_issuer.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# remove_ca_cert_bundle
##############################################
initTest "Remove CA cert bundle"
state=$(ccf_cose_sign1 --content $proposals_dir/remove_ca_cert_bundle.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_node_certificate_validity
##############################################
initTest "Set node certificate validity"
node_id=$(curl --silent --cacert $certificate_dir/service_cert.pem $server/node/network/nodes | jq -r '.nodes[] | select(.status=="Trusted") | .node_id' | head -1)
valid_from=$(date +%Y%m%d%H%M%SZ)

cat > $proposals_dir/set_node_certificate_validity.json <<EOF
{
   "actions": [
    {
        "name": "set_node_certificate_validity",
        "args": {
            "node_id": "$node_id",
            "valid_from": "$valid_from",
            "validity_period_days": 90
        }
      }
    ]
}
EOF

state="Open"
response_code=$(ccf_cose_sign1 --content $proposals_dir/set_node_certificate_validity.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem -o /dev/null --write-out '%{response_code}' $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
if [ $response_code -eq 200 ];
then
    state="Accepted"
fi
checkState $state $rc $el

##############################################
# set_service_certificate_validity
##############################################
initTest "Set service certificate validity"
valid_from=$(date +%Y%m%d%H%M%SZ)

cat > $proposals_dir/set_service_certificate_validity.json <<EOF
{
   "actions": [
    {
        "name": "set_service_certificate_validity",
        "args": {
            "valid_from": "$valid_from",
            "validity_period_days": 90
        }
      }
    ]
}
EOF

state="Open"
response_code=$(ccf_cose_sign1 --content $proposals_dir/set_service_certificate_validity.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem -o /dev/null --write-out '%{response_code}' $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @-)
if [ $response_code -eq 200 ];
then
    state="Accepted"
fi
checkState $state $rc $el

##############################################
# trigger_snapshot
##############################################
initTest "Trigger snapshot"
state=$(ccf_cose_sign1 \
--content $proposals_dir/trigger_snapshot.json \
--signing-cert $certificate_dir/member0_cert.pem \
--signing-key $certificate_dir/member0_privk.pem \
--ccf-gov-msg-type proposal \
--ccf-gov-msg-created_at `date -uIs` | \
curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | \
jq -r '.state')

checkState $state $rc $el

##############################################
# trigger_ledger_chunk
##############################################
initTest "Trigger ledger chunk"
state=$(ccf_cose_sign1 \
--content $proposals_dir/trigger_ledger_chunk.json \
--signing-cert $certificate_dir/member0_cert.pem \
--signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# add_node_code
##############################################
initTest "Add node code"
state=$(ccf_cose_sign1 --content $proposals_dir/add_node_code.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# remove_node_code
##############################################
initTest "Remove node code"
state=$(ccf_cose_sign1 --content $proposals_dir/remove_node_code.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_member
##############################################
initTest "Set member"
state=$(ccf_cose_sign1 --content $proposals_dir/set_member.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

echo && printf "Total tests:$TEST, Passed:$PASS, Failed:$FAIL, Test coverage:%.2f%%\n" "$(bc -l <<< "(($PASS/$TEST)*100)")"