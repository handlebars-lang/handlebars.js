#!/bin/bash

set -e

cd "$( dirname "$( readlink -f "$0" )" )" || exit 1
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# This script tests with precompiler and the built distribution with multiple NodeJS version.
# This test is simple by design. It merely ensures, that calling Handlebars does not fail with old versions.
# It does (almost) not test for correctness, because that is already done in the mocha-tests.
# And it does not use any NodeJS based testing framework to make this part independent of the Node version.

unset npm_config_prefix

echo "Handlebars should be able to run in various versions of NodeJS"
for node_version_to_test in 18 20; do

    rm -rf target node_modules package-lock.json
    mkdir target

    nvm install "$node_version_to_test"
    nvm exec "$node_version_to_test" npm install
    nvm exec "$node_version_to_test" npm run test
    nvm exec "$node_version_to_test" npm run test-precompile

    echo Success
done
