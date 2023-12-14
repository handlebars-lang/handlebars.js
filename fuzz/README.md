# Fuzz Testing

Fuzz testing is:

> An automated software testing technique that involves providing invalid, unexpected, or random data as inputs to a program.

We use coverage guided fuzz testing to automatically discover bugs in Handlebars.js.

This `fuzz/` directory contains the configuration and the fuzz tests for Handlebars.js.
To generate and run fuzz tests, we use the [Jazzer.js](https://github.com/CodeIntelligenceTesting/jazzer.js/) library.

## Running a fuzzer

This directory contains fuzzers like for example `compiler.fuzz`. You can run it with:

```sh
$ npx jazzer fuzz/compiler.fuzz fuzz/corpus/compiler.fuzz/ --sync
```

You should see output that looks something like this:

```
#7      INITED cov: 20 ft: 20 corp: 1/4b exec/s: 0 rss: 162Mb
#20     REDUCE cov: 20 ft: 20 corp: 1/3b lim: 4 exec/s: 0 rss: 162Mb L: 3/3 MS: 3 CopyPart-ChangeBit-EraseBytes-
#45     REDUCE cov: 20 ft: 20 corp: 1/2b lim: 4 exec/s: 0 rss: 162Mb L: 2/2 MS: 5 CrossOver-ChangeByte-CopyPart-CopyPart-EraseBytes-
#46     REDUCE cov: 20 ft: 20 corp: 1/1b lim: 4 exec/s: 0 rss: 162Mb L: 1/1 MS: 1 EraseBytes-
#219    REDUCE cov: 25 ft: 25 corp: 2/4b lim: 4 exec/s: 0 rss: 162Mb L: 3/3 MS: 3 ChangeBit-ChangeBit-CMP- DE: "\001\000"-
#220    REDUCE cov: 25 ft: 25 corp: 2/3b lim: 4 exec/s: 0 rss: 162Mb L: 2/2 MS: 1 EraseBytes-
#293    REDUCE cov: 25 ft: 25 corp: 2/2b lim: 4 exec/s: 0 rss: 162Mb L: 1/1 MS: 3 ChangeByte-ShuffleBytes-EraseBytes-
```

It will continue to generate random inputs forever, until it finds a
bug or is terminated. The testcases for bugs it finds can be seen in
the form of `crash-*` or `timeout-*` at the place from where command is run.
You can rerun the fuzzer on a single input by passing it on the
command line `npx jazzer fuzz/compiler.fuzz /path/to/testcase`.

## The corpus

The corpus is a set of test inputs, stored as individual files,
provided to the fuzz target as a starting point (to “seed” the mutations).
The quality of the seed corpus has a huge impact on fuzzing efficiency;
the higher the quality, the easier it is for the fuzzer to discover new code paths.
The ideal corpus is a minimal set of inputs that provides maximal code coverage
Each fuzzer has an individual corpus under `fuzz/corpus/test_name`.
