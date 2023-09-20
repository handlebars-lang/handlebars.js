#!/bin/bash

set -e

# Cleanup: package-lock and "npm ci" is not working with local dependencies
rm -rf dist package-lock.json
npm install
npm run build

node dist/bundle.js
echo "Success"
