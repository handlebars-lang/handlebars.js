#!/bin/bash

set -e

cd "$( dirname "$( readlink -f "$0" )" )" || exit 1
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# This script tests with precompiler and the built distribution with multiple NodeJS version.
# The rest of the travis-build will only work with newer NodeJS versions, because the build
# tools don't support older versions.
# However, the built distribution should work with older NodeJS versions as well.
# This test is simple by design. It merely ensures, that calling Handlebars does not fail with old versions.
# It does (almost) not test for correctness, because that is already done in the mocha-tests.
# And it does not use any NodeJS based testing framwork to make this part independent of the Node version.

unset npm_config_prefix

echo "Handlebars should be able to run in various versions of NodeJS"
for i in  0.10 0.12 4 5 6 7 8 9 10 11 ; do
    rm target node_modules package-lock.json -rf
    mkdir target
    nvm install "$i"
    nvm exec "$i" npm install
    nvm exec "$i" npm run test
    nvm exec "$i" npm run test-precompile

    echo Success
done
