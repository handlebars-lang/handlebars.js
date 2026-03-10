# How to Contribute

## Reporting Security Issues

Please refer to our [Security Policy](https://github.com/handlebars-lang/handlebars.js/blob/master/SECURITY.md).

## Reporting Issues

Please refer to our [FAQ](https://github.com/handlebars-lang/handlebars.js/blob/master/FAQ.md) for common issues that people run into.

Should you run into other issues with the project, please don't hesitate to let us know by filing an [issue][issue]!

In general, we are going to ask for an **example** of the problem failing, which can be as simple as a jsfiddle/jsbin/etc. We've put together a jsfiddle **[template][jsfiddle]** to ease this. (We will keep this link up to date as new releases occur, so feel free to check back here).

Pull requests containing only failing tests demonstrating the issue are welcomed and this also helps ensure that your issue won't regress in the future once it's fixed.

Documentation issues on the [handlebarsjs.com](https://handlebarsjs.com) site should be reported on [handlebars-lang/docs](https://github.com/handlebars-lang/docs).

## Branches

- The branch `master` contains the current development version (v5).
- The branch `4.x` contains the previous stable version. Only critical bugfixes are backported there.

## Pull Requests

We also accept [pull requests][pull-request]!

Generally we like to see pull requests that

- Maintain the existing code style
- Are focused on a single change (i.e. avoid large refactoring or style adjustments in untouched code if not the primary goal of the pull request)
- Have [good commit messages](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
- Have tests
- Don't significantly decrease the current code coverage (see coverage/lcov-report/index.html)

## Building

To build Handlebars.js you'll need Node.js installed.

Before building, you need to make sure that the Git submodule `spec/mustache` is included (i.e. the directory `spec/mustache` should not be empty). To include it, if using Git version 1.6.5 or newer, use `git clone --recursive` rather than `git clone`. Or, if you already cloned without `--recursive`, use `git submodule update --init`.

Project dependencies may be installed via `npm install`.

To build Handlebars.js from scratch, run `npm run build` in the root of the project. That will compile CJS modules via SWC and bundle UMD distributions via rspack, outputting results to the dist/ folder. To run tests, use `npm test`.

If you notice any problems, please report them to the GitHub issue tracker at
[http://github.com/handlebars-lang/handlebars.js/issues](http://github.com/handlebars-lang/handlebars.js/issues).

## Running Tests

To run tests locally, first install all dependencies.

```sh
npm install
```

Clone the mustache specs into the spec/mustache folder.

```sh
cd spec
rm -r mustache
git clone https://github.com/mustache/spec.git mustache
```

From the root directory, run the tests.

```sh
npm test
```

## Linting and Formatting

Handlebars uses `oxlint` for linting, `oxfmt` for formatting, and `eslint` (with `eslint-plugin-compat`) for browser API compatibility checks.
Committed files are linted and formatted in a pre-commit hook.

You can use the following scripts to make sure that the CI job does not fail:

- **npm run lint** will run all linters and fail on warnings
- **npm run format** will format all files
- **npm run check-before-pull-request** will perform all checks that our CI job does, excluding integration tests.
- **npm run test:integration** will run integration tests (bundler compatibility with webpack, rollup, etc.)
  These tests only work on Linux.

## Releasing the latest version

Before attempting the release Handlebars, please make sure that you have the following authorizations:

- Push-access to `handlebars-lang/handlebars.js`
- Publishing rights on npmjs.com for the `handlebars` package
- Publishing rights on gemfury for the `handlebars-source` package
- Push-access to the repo for legacy package managers: `components/handlebars`
- Push-access to the production-repo of the handlebars site: `handlebars-lang/handlebarsjs.com-github-pages`

_When releasing a previous version of Handlebars, please look into the CONTRIBUNG.md in the corresponding branch._

A full release may be completed with the following:

```
npm ci
npm run build
npm publish
```

After the release, you should check that all places have really been updated. Especially verify that the `latest`-tags
in those places still point to the latest version

- [The npm-package](https://www.npmjs.com/package/handlebars) (check latest-tag)
- [The bower package](https://github.com/components/handlebars.js) (check the package.json)
- [The AWS S3 Bucket](https://s3.amazonaws.com/builds.handlebarsjs.com) (check latest-tag)
- [RubyGems](https://rubygems.org/gems/handlebars-source)

When everything is OK, the **handlebars site** needs to be updated.

Go to the master branch of the repo [handlebars-lang/docs](https://github.com/handlebars-lang/docs/tree/master)
and make a minimal change to the README. This will invoke a github-action that redeploys
the site, fetching the latest version-number from the npm-registry.
(note that the default-branch of this repo is not the master and regular changes are done
in the `handlebars-lang/docs`-repo).

[generator-release]: https://github.com/walmartlabs/generator-release
[pull-request]: https://github.com/handlebars-lang/handlebars.js/pull/new/master
[issue]: https://github.com/handlebars-lang/handlebars.js/issues/new
[jsfiddle]: https://jsfiddle.net/4nbwjaqz/4/
