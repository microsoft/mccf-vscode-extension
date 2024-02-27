#!/bin/bash
trap cleanup EXIT

set -euo pipefail

declare certificate_dir=$(mktemp -d)
declare signing_cert=""
declare signing_key=""
declare server=""
declare proposals_dir=$(mktemp -d)

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
    echo "Run tests to validate if the operator actions are allowed in the custom constitution."
    echo "An opeator member must exist in the CCF network. An operator member has the member data attribute 'is_operator' set to true."
    echo ""
    echo "usage: ./test_operator_actions.sh --address <IPADDRESS:PORT> --signing-cert <CERT> --signing-key <KEY>"
    echo "Example: ./test_operator_actions.sh --address 127.0.0.1:8000 --signing-cert ./workspace/sandbox_common/member0_cert.pem --signing-key ./workspace/sandbox_common/member0_privk.pem"
    echo ""
    echo "  --address       string      The address of the primary CCF node"
    echo "  --signing-cert  string      The operator signing certificate"
    echo "  --signing-key   string      The operator signing key"
    echo ""
}

function failed {
    echo && printf "💥 Script failed: %s\n\n" "$1"
    exit 1
}

function cleanup {
    rm -rf $certificate_dir $proposals_dir
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
if [ $# -ne 6 ]; then
    usage
    exit 1
fi

while [ $# -gt 0 ]
do
    case "$1" in
        --address) address="$2"; shift 2;;
        --signing-cert) signing_cert="$2"; shift 2;;
        --signing-key) signing_key="$2"; shift 2;;
        --help) usage; exit 0;;

        *) usage; exit 1;;
    esac
done

# validate parameters
if [ -z "${signing_cert}" ]; then
    failed "Operator signing certificate is required."
fi
if [ -z "${signing_key}" ]; then
    failed "Operator signing key is required."
fi
if [ -z "$address" ]; then
    failed "CCF network address is required. Example: https://127.0.0.1:8000"
fi

server="${address}"

#####################################################
# Download the service certificate
#####################################################
# The node is not up yet and the certificate will not be created until it
# return 200. We can't pass in the ca_cert. Let's use -k to bypass the server cert check.
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
# Tests
##############################################
initTest "Transition service to open"
service_cert=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}'  $certificate_dir/service_cert.pem)

cat > $proposals_dir/transition_service_to_open.json <<EOF
{"actions":[{"name":"transition_service_to_open","args":{"next_service_identity":"$service_cert"}}]}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/transition_service_to_open.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_ca_cert_bundle
##############################################
initTest "Set CA cert bundle"

cat > $proposals_dir/set_ca_cert_bundle.json <<EOF
{"actions":[{"name":"set_ca_cert_bundle","args":{"name":"jwt_ms","cert_bundle":"-----BEGIN CERTIFICATE-----\nMIICtDCCAZygAwIBAgIUD7xmXLQWbN/q+tuH97Aq2krO0GAwDQYJKoZIhvcNAQEL\nBQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTIyMDExMjEzNDMzNloXDTIyMDEy\nMjEzNDMzNlowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF\nAAOCAQ8AMIIBCgKCAQEAoWXwixcQ0CrZQAD9Ojo0kxKtrsJB0dmxwKGx/JH2VQYh\nYQ9+8zSuXKW7L0dJL3Qf9R7eJvj1w4i/gPHSggsgrp+MbYLos3DK1M3wdATpsn/r\nhVFCuVpq9nVOZQh9Uiq1fbsYBpoJZ+aSpRJrqK8VaQDr/zPVnU72zYSxgEvwll+e\nvw1+erna3nZevf02hGvD1HU2DBEIkyj50yRzfKufGbw70ySxDAxCpkM+Qsw+WD5/\ncI2D8mhMFA7NdPIbB0OWwCOqrFxtwkA2N11nqJlodzFmcdCDE/fyZc2/Fer+C4ol\nhnYBXVqEodlbytmYHIWB3+XbymDrbqPeCvr2I6nK2QIDAQABMA0GCSqGSIb3DQEB\nCwUAA4IBAQBrHD9cUy5mfkelWzJRknaK3BszUWSwOjjXYh0vFTW8ixZUjKfQDpbe\nPEL3aV3IgnBEwFnormhGCLcOatAGLCgZ//FREts8KaNgyrObKyuMLPQi5vf5/ucG\n/68mGwq2hdh0+ysVqcjjLQCTfbPJPUQ5V2hOh79jOy29JdavcBGR4SeRdOgzdcwA\nd9/T8VuoC6tjt2OF7IJ59JOSBWMcxCbr7KyyJjuxykzyjDa/XQs2Egt4WE+ZVUgc\nav1tQB2leiJGbjhswhLMe7NbuOtwcELsILpPo3pbdKEMlRFngj7H80IFurxtdu/M\nN2D/+LkySi6UDM8q6ADSdjG+cnNzSjEo\n-----END CERTIFICATE-----\n"}}]}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/set_ca_cert_bundle.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_jwt_issuer
##############################################
initTest "Set jwt issuer"

cat > $proposals_dir/set_jwt_issuer.json <<EOF
{"actions":[{"name":"set_jwt_issuer","args":{"issuer":"https://login.microsoftonline.com/common/v2.0","key_filter":"all","ca_cert_bundle_name":"jwt_ms","auto_refresh":true}}]}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/set_jwt_issuer.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_jwt_public_signing_keys
##############################################
initTest "Set jwt public signing keys"

cat > $proposals_dir/set_jwt_public_signing_keys.json <<EOF
{"actions":[{"name":"set_jwt_public_signing_keys","args":{"issuer":"https://login.microsoftonline.com/common/v2.0","jwks":{"keys":[{"kty":"RSA","kid":"my_kid","x5c":["MIICrDCCAZSgAwIBAgIUcj2cyqhj1U8XzZ0gvV1sF4e4vtowDQYJKoZIhvcNAQELBQAwEDEOMAwGA1UEAwwFZHVtbXkwHhcNMjIwMTEyMTM0MzMzWhcNMjIwMTIyMTM0MzMzWjAQMQ4wDAYDVQQDDAVkdW1teTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAK/RrDSau3y4uI0AMKRfeC/aflZ7LfqFeaWOrj3WrDd1lWIJNJfXw4yrjyLq/NxDPF/3Rk4JBA4FPxUuQ2gwiLaZr9/OJjG2e+1sT9Sj243IC4tKvm8ilUtbgx9f9GvyoP5UhnZHa3GQ2MnRpTtzOq2u+XhjrQBfadGEVjUCpbwRaV7vTUr2WZQ/e1HbLFg0vdApP/U2Z/p5LUyRooLIu12mgMFZAd8zYWXsHGx+D4F8DeRpuPDrF5CKOeA2HvhIeYy+kKMhSuE2wBn3lHtTstZfoJoJJuDPwr5F58jlBHBdRL7BtfB2O8jK5iPNb3bZnyAgQ4xJVr/4wUcbeI7SA28CAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAXlso7E6vqH0W9w3jMrtIWJiZWZi1O+JQ3TkcVX0qTHHQRSjFyY+wjjL11ERZqz2XnrfQZDQdlpB4g7EXh24lN7QE5XuxN6gfRVDPVrY8+mg5qXBW6yz70Kgt7iuy5QjTOMU3GjqYBjObcXBqp+/p6mU0cTFHSt7xQjK2XI1AdOuxeAtUsko6+pvMwZus2RARzJurSAuWh4mU2ozALmUlAD+looOsvqui4s6CNUUakfSUlDj5drnYOHqqrRXDVonzDCDJgN/ZJubwFkTmZ1Urr5OTR5/WdC9G69RU27eqyRFuWlCafy8+hwyo6sZykDJpa6FBbeXWfm7s8Sj77y0Gdg=="]}]}}}]}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/set_jwt_public_signing_keys.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# remove_jwt_issuer
##############################################
initTest "Remove jwt issuer"

cat > $proposals_dir/remove_jwt_issuer.json <<EOF
{"actions":[{"name":"remove_jwt_issuer","args":{"issuer":"https://login.microsoftonline.com/common/v2.0"}}]}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/remove_jwt_issuer.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# remove_ca_cert_bundle
##############################################
initTest "Remove CA cert bundle"

cat > $proposals_dir/remove_ca_cert_bundle.json <<EOF
{"actions":[{"name":"remove_ca_cert_bundle","args":{"name":"jwt_ms"}}]}
EOF

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
cat > $proposals_dir/trigger_snapshot.json <<EOF
{"actions":[{"name":"trigger_snapshot","args":{}}]}
EOF

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

cat > $proposals_dir/trigger_ledger_chunk.json <<EOF
{"actions":[{"name":"trigger_ledger_chunk","args":{}}]}
EOF

state=$(ccf_cose_sign1 \
--content $proposals_dir/trigger_ledger_chunk.json \
--signing-cert $certificate_dir/member0_cert.pem \
--signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# add_node_code
##############################################
initTest "Add node code"

cat > $proposals_dir/add_node_code.json <<EOF
{"actions":[{"name":"add_node_code","args":{"new_code_id":"0000000000000000000000000000000000000000000000000000000000000001","existing_code_id":"0000000000000000000000000000000000000000000000000000000000000000"}}]}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/add_node_code.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# remove_node_code
##############################################
initTest "Remove node code"

cat > $proposals_dir/remove_node_code.json <<EOF
{"actions":[{"name":"remove_node_code","args":{"code_id_to_remove":"0000000000000000000000000000000000000000000000000000000000000001","remaining_code_id":"0000000000000000000000000000000000000000000000000000000000000000"}}]}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/remove_node_code.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_member
##############################################
initTest "Set member"

cat > $proposals_dir/set_member.json <<EOF
{"actions":[{"name":"set_member","args":{"cert":"-----BEGIN CERTIFICATE-----\nMIIBtjCCATygAwIBAgIUZl7cRJUkFXX48JXFMGnONL/bF0owCgYIKoZIzj0EAwMw\nEjEQMA4GA1UEAwwHbWVtYmVyMDAeFw0yMzA4MjEyMTE0MjNaFw0yNDA4MjAyMTE0\nMjNaMBIxEDAOBgNVBAMMB21lbWJlcjAwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQ/\nvyFFiFgy0PAj8pZ+/H3QhazCaZxJVnu76yNDAuIxeEjhigd/gE+vadIgld8uYYLU\nwWw+taojfbQIBPss1mX+6d8pJKWe0mAGxhJVphr8YJXH6x+VLAkcAs/Jmm1t/iCj\nUzBRMB0GA1UdDgQWBBRnLuYb9RZ54kQUgQf0kJWtkUKdljAfBgNVHSMEGDAWgBRn\nLuYb9RZ54kQUgQf0kJWtkUKdljAPBgNVHRMBAf8EBTADAQH/MAoGCCqGSM49BAMD\nA2gAMGUCMQDSOsxyCrKsfFeGfeHMveAzov1MSviTQ3WOPHi2Js95By8RyPgdVJeG\njzheJW0k1IICMG8BjhMtHIOnl2ZrwCV31GoOUqzPr3dsAWmuG/SCShAqBTrU+64K\nVAb1sqyvksJigg==\n-----END CERTIFICATE-----","encyption_pub_key":"","data":{"identifier":"member0","dept":"HR"}}}]}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/set_member.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

##############################################
# set_node_data
##############################################
initTest "Set node data"

node_id=$(curl --silent --cacert $certificate_dir/service_cert.pem $server/node/network/nodes|jq '.nodes[0].node_id')
cat > $proposals_dir/set_node_data.json <<EOF
{"actions":[{"name":"set_node_data","args":{"node_id":$node_id,"node_data":"test data"}}]}
EOF

state=$(ccf_cose_sign1 --content $proposals_dir/set_node_data.json --signing-cert $certificate_dir/member0_cert.pem --signing-key $certificate_dir/member0_privk.pem --ccf-gov-msg-type proposal --ccf-gov-msg-created_at `date -uIs` | curl --silent --cacert $certificate_dir/service_cert.pem $server/gov/proposals -H 'Content-Type: application/cose' --data-binary @- | jq -r '.state')
checkState $state $rc $el

echo && printf "Total tests:$TEST, Passed:$PASS, Failed:$FAIL, Test coverage:%.2f%%\n" "$(bc -l <<< "(($PASS/$TEST)*100)")"