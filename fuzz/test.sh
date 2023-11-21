#!/bin/bash

set -e

if [ $# -eq 0 ]; then
  echo "Usage: $0 <max_total_time> 
The <max_total_time> is passed to the internal fuzzing engine 
(libFuzzer) to stop the fuzzing run after 'N' seconds."
  exit 1
fi

max_total_time=$1

for i in ./*.fuzz.js; do
  target=$(basename "$i" .js)
  echo "-- Running $target for $max_total_time seconds."
  npx jazzer $target corpus/$target --sync -- -max_total_time=$max_total_time;
done
