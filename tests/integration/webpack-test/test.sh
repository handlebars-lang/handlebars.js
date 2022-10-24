#!/bin/bash

set -e

run_tests () {
  for i in dist/*-test.js ; do
    echo "----------------------"
    echo "-- Running $i"
    echo "----------------------"
    node "$i"
    echo "Success"
  done
}

# Cleanup: package-lock and "npm ci" is not working with local dependencies
rm dist package-lock.json -rf
npm install --legacy-peer-deps

# Test with webpack 4
npm install --legacy-peer-deps --no-save webpack@^4 webpack-cli@^3
npm run build
run_tests

# Test with webpack 5
npm install --legacy-peer-deps --no-save webpack@^5 webpack-cli@^4
npm run build
run_tests