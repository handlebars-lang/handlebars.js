#!/bin/bash

cd "$( dirname "$( readlink -f "$0" )" )" || exit 1

for i in */test.sh ; do
  (
    echo "----------------------------------------"
    echo "-- Running integration test: $i"
    echo "----------------------------------------"
    cd "$( dirname "$i" )" || exit 1
    ./test.sh || exit 1
  )
done