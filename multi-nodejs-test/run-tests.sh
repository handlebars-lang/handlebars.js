#!/bin/bash

cd "$( dirname "$( readlink -f "$0" )" )"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# This script tests with precompiler and the built distribution with multiple NodeJS version.
# The rest of the travis-build will only work with newer NodeJS versions, because the build
# tools don't support older versions.
# However, the built distribution should work with older NodeJS versions as well.
# This test is simple by design. It merely ensures, that calling Handlebars does not fail with old versions.
# It does (almost) not test for correctness, because that is already done in the mocha-tests.
# And it does not use any NodeJS based testing framwork to make this part independent of the Node version.

# A list of NodeJS versions is expected as cli-args
echo "Handlebars should be able to run in various versions of NodeJS"
for i in "$@" ; do
    nvm install "$i"
    nvm exec "$i" node ./run-handlebars.js >/dev/null || exit 1
    nvm exec "$i" node ../bin/handlebars template.txt.hbs >/dev/null || exit 1
    echo Success
done