#!/bin/bash

set -e

# Cleanup: package-lock and "npm ci" is not working with local dependencies
rm dist package-lock.json -rf
npm install
npm run build

node dist/bundle.js
echo "Success"