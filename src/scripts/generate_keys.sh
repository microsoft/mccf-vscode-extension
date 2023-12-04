#!/bin/bash

set -euo pipefail

source common_utils.sh

trap 'handle_error' EXIT
init_env

function usage {
    echo ""
    echo "Generate public certificate and private key."
    echo ""
    echo "usage: ./generate_keys.sh --dest-folder string "
    echo ""
    echo "  --id            string     The id for generating the keys and certificates"
    echo "  --dest-folder   string     The destination folder for the proposal file"
    echo "  --enc-key       string       Whether to generate an encryption key"
    echo ""
    exit 0
}

# parse parameters
if [ $# -eq 0 ]; then
    usage
    exit 1
fi

enc_key=false

while [ $# -gt 0 ]
do
    case $1 in
        -h|-\?|--help)
            usage
            exit 0
            ;;
        --id)
            id="$2"
            shift
            ;;
        --dest-folder)
            dest_folder="$2"
            shift
            ;;
        --enc-key)
            enc_key=true
            ;;
        *)
            break
    esac
    shift
done

# validate parameters
if [ -z "$id" ]; then
	failed "Missing parameter --id"
elif [ -z "$dest_folder" ]; then
	failed "Missing parameter --dest-folder"
fi

curr_dir=$(pwd)

cd "$dest_folder"

echo "Creating keys..."

# Generate keys using keygenerator.sh
if [ "$enc_key" = true ]; then
    keygenerator.sh --name "$id" --gen-enc-key
else
    keygenerator.sh --name "$id"
fi

cd "$curr_dir"

echo "Keys created at $dest_folder"

# Deactivate virtual environment
deactivate_env
