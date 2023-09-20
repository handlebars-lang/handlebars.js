#!/bin/bash

set -e

# Cleanup: package-lock and "npm ci" is not working with local dependencies
rm -rf dist package-lock.json
npm install --legacy-peer-deps
npm run build

for i in dist/*-test.js ; do
  echo "----------------------"
  echo "-- Running $i"
  echo "----------------------"
  node "$i"
  echo "Success"
done
