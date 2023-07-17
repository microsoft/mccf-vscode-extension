#!/bin/bash

set -euo pipefail

source common_utils.sh

# create set_member json proposal file
function create_member_proposal {
  local certFile=$1
  local keyFile=$2
  local setUserFile=$3

  cert=$(< "$certFile" sed '$!G' | paste -sd '\\n' -)
  key=$(< "$keyFile" sed '$!G' | paste -sd '\\n' -)

  json='{"actions":[{"name": "set_member", "args": { "cert": "'${cert}'\n", "encryption_pub_key": "'${key}'\n"} }  ]}'

    echo "$json" > "$setUserFile"
  }

function usage {
  echo ""
  echo "Generate set_member.json proposal for adding members to CCF."
  echo ""
  echo "usage: ./add_member.sh --cert-file string --pubk-file string --id string"
  echo ""
  echo "  --cert-file     string     The certificate .pem file for the member"
  echo "  --pubk-file     string     The encryption public key .pem file for the member"
  echo "  --dest-folder   string     The destination folder for the proposal file"
  echo "  --id            string     The id of the proposal file"
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
    --cert_file) cert_file="$2"; shift;;
    --pubk_file) pubk_file="$2"; shift;;
    --dest_folder) dest_folder="$2"; shift;;
    --id) id="$2"; shift;;
    --help) usage; exit 0; shift;;
    --) shift;;
  esac
  shift;
done

# validate parameters
if [ -z "$cert_file" ]; then
	failed "Missing parameter --cert-file"
elif [ -z "$pubk_file" ]; then
	failed "Missing parameter --pubk-file"
elif [ -z "$dest_folder" ]; then
	failed "Missing parameter --dest-folder"
elif [ -z "$id" ]; then
  failed "Missing parameter --id"
fi

proposal_json_file="${dest_folder}/set_${id}.json"

echo "Creating member json proposal file..."
create_member_proposal "$cert_file" "$pubk_file" "$proposal_json_file"

echo "Proposal json file created at $dest_folder: $proposal_json_file"