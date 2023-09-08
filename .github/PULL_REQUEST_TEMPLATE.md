Before creating a pull-request, please check https://github.com/handlebars-lang/handlebars.js/blob/master/CONTRIBUTING.md first.

Generally we like to see pull requests that

- [ ] Please don't start pull requests for security issues. Instead, file a report at https://www.npmjs.com/advisories/report?package=handlebars
- [ ] Maintain the existing code style
- [ ] Are focused on a single change (i.e. avoid large refactoring or style adjustments in untouched code if not the primary goal of the pull request)
- [ ] Have good commit messages
- [ ] Have tests
- [ ] Have the [typings](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) (types/index.d.ts) updated on every API change. If you need help, updating those, please mention that in the PR description.
- [ ] Don't significantly decrease the current code coverage (see coverage/lcov-report/index.html)
- [ ] Currently, the `4.x`-branch contains the latest version. Please target that branch in the PR.
