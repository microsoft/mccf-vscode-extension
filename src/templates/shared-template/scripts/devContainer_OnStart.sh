#!/bin/bash
set -euo pipefail

# This script is executed from the root of the repository.
npm install --prefix .

# Install CCF python package
pip install ccf==4.0.14
