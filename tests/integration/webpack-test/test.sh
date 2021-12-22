#!/bin/bash

set -e

# Cleanup: package-lock and "npm ci" is not working with local dependencies
rm dist package-lock.json -rf
npm install
npm run build

for i in dist/*-test.js ; do
  echo "----------------------"
  echo "-- Running $i"
  echo "----------------------"
  node "$i"
  echo "Success"
done