# How to Contribute

## Reporting Issues

Please see our [FAQ](https://github.com/wycats/handlebars.js/blob/master/FAQ.md) for common issues that people run into.

Should you run into other issues with the project, please don't hesitate to let us know by filing an [issue][issue]! In general we are going to ask for an example of the problem failing, which can be as simple as a jsfiddle/jsbin/etc. We've put together a jsfiddle [template][jsfiddle] to ease this. (We will keep this link up to date as new releases occur, so feel free to check back here)

Pull requests containing only failing tests demonstrating the issue are welcomed and this also helps ensure that your issue won't regress in the future once it's fixed.

Documentation issues on the handlebarsjs.com site should be reported on [handlebars-site](https://github.com/wycats/handlebars-site).

## Branches

- The branch `4.x` contains the currently released version. Bugfixes should be made in this branch.
- The branch `master` contains the next version. A release date is not yet specified. Maintainers
  should merge the branch `4.x` into the master branch regularly.

## Pull Requests

We also accept [pull requests][pull-request]!

Generally we like to see pull requests that

- Maintain the existing code style
- Are focused on a single change (i.e. avoid large refactoring or style adjustments in untouched code if not the primary goal of the pull request)
- Have [good commit messages](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
- Have tests
- Don't significantly decrease the current code coverage (see coverage/lcov-report/index.html)

## Building

To build Handlebars.js you'll need a few things installed.

- Node.js
- [Grunt](http://gruntjs.com/getting-started)

Before building, you need to make sure that the Git submodule `spec/mustache` is included (i.e. the directory `spec/mustache` should not be empty). To include it, if using Git version 1.6.5 or newer, use `git clone --recursive` rather than `git clone`. Or, if you already cloned without `--recursive`, use `git submodule update --init`.

Project dependencies may be installed via `npm install`.

To build Handlebars.js from scratch, you'll want to run `grunt`
in the root of the project. That will build Handlebars and output the
results to the dist/ folder. To re-run tests, run `grunt test` or `npm test`.
You can also run our set of benchmarks with `grunt bench`.

The `grunt dev` implements watching for tests and allows for in browser testing at `http://localhost:9999/spec/`.

If you notice any problems, please report them to the GitHub issue tracker at
[http://github.com/wycats/handlebars.js/issues](http://github.com/wycats/handlebars.js/issues).

##Running Tests

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

Handlebars uses `eslint` to enforce best-practices and `prettier` to auto-format files.
We do linting and formatting in two phases:

- Committed files are linted and formatted in a pre-commit hook. In this stage eslint-errors are forbidden,
  while warnings are allowed.
- The travis-ci job also lints all files and checks if they are formatted correctly. In this stage, warnings
  are forbidden.

You can use the following scripts to make sure that the travis-job does not fail:

- **npm run lint** will run `eslint` and fail on warnings
- **npm run format** will run `prettier` on all files
- **npm run check-before-pull-request** will perform all most checks that travis does in its build-job, excluding the "integration-test".
- **npm run integration-test** will run integration tests (using old NodeJS versions and integrations with webpack, babel and so on)
  These tests only work on a Linux-machine with `nvm` installed (for running tests in multiple versions of NodeJS).

## Releasing the latest version

Before attempting the release Handlebars, please make sure that you have the following authorizations:

- Push-access to `wycats/handlebars.js`
- Publishing rights on npmjs.com for the `handlebars` package
- Publishing rights on gemfury for the `handlebars-source` package
- Push-access to the repo for legacy package managers: `components/handlebars`
- Push-access to the production-repo of the handlebars site: `handlebars-lang/handlebarsjs.com-github-pages`

_When releasing a previous version of Handlebars, please look into the CONTRIBUNG.md in the corresponding branch._

Handlebars utilizes the [release yeoman generator][generator-release] to perform most release tasks.

A full release may be completed with the following:

```
npm ci
yo release
npm publish
yo release:publish components handlebars.js dist/components/

cd dist/components/
gem build handlebars-source.gemspec
gem push handlebars-source-*.gem
```

After the release, you should check that all places have really been updated. Especially verify that the `latest`-tags
in those places still point to the latest version

- [The npm-package](https://www.npmjs.com/package/handlebars) (check latest-tag)
- [The bower package](https://github.com/components/handlebars.js) (check the package.json)
- [The AWS S3 Bucket](https://s3.amazonaws.com/builds.handlebarsjs.com) (check latest-tag)
- [RubyGems](https://rubygems.org/gems/handlebars-source)

When everything is OK, the **handlebars site** needs to be updated.

Go to the master branch of the repo [handlebars-lang/handlebarsjs.com-github-pages](https://github.com/handlebars-lang/handlebarsjs.com-github-pages/tree/master)
and make a minimal change to the README. This will invoke a github-action that redeploys
the site, fetching the latest version-number from the npm-registry.
(note that the default-branch of this repo is not the master and regular changes are done
in the `handlebars-lang/docs`-repo).

[generator-release]: https://github.com/walmartlabs/generator-release
[pull-request]: https://github.com/wycats/handlebars.js/pull/new/master
[issue]: https://github.com/wycats/handlebars.js/issues/new
[jsfiddle]: https://jsfiddle.net/9D88g/180/
