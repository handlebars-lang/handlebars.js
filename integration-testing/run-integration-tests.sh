#!/bin/bash

set -e

cd "$( dirname "$( readlink -f "$0" )" )"

for i in */test.sh ; do
  (
    echo "----------------------------------------"
    echo "-- Running integration test: $i"
    echo "----------------------------------------"
    cd "$( dirname "$i" )"
    ./test.sh
  )
done
