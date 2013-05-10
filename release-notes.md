# Release Notes

## Development

- #471 - Create release notes (These!)
- #458 - Fix `./foo` syntax (@jpfiset)
- #460 - Allow `:` in unescaped identifers (@jpfiset)
- #456 - Allow escaping of `\\`
- #211 - Fix exception in `escapeExpression`
- #375 - Escape unicode newlines
- #461 - Do not fail when compiling `""`
- #302 - Fix sanity check in knownHelpersOnly mode
- #369 - Allow registration of multiple helpers and partial by passing definition object
- Handle empty context in `with` (@thejohnfreeman)
- Support custom template extensions in CLI (@matteoagosti)
- Fix Rhino support (@broady)
- Include contexts in string mode (@leshill)
- Return precompiled scripts when compiling to AMD (@JamesMaroney)
- Docs updates (@iangreenleaf, @gilesbowkett, @utkarsh2012)
- Fix `toString` handling under IE and browserify (@tommydudebreaux)
- Add program metadata

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.10...master)

## v1.0.10 - Node - Feb 27 2013

- #428 - Fix incorrect rendering of nested programs
- Fix exception message (@tricknotes)
- Added negative number literal support
- Concert library to single IIFE
- Add handlebars-source gemspec (@machty)

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.9...v1.0.10)

## v1.0.9 - Node - Feb 15 2013

- Added `Handlebars.create` API in node module for sandboxed instances (@tommydudebreaux)

[Commits](https://github.com/wycats/handlebars.js/compare/1.0.0-rc.3...v1.0.9)

## 1.0.0-rc3 - Browser - Feb 14 2013

- Prevent use of `this` or `..` in illogical place (@leshill)
- Allow AST passing for `parse`/`compile`/`precompile` (@machty)
- Optimize generated output by inlining statements where possible
- Check compiler version when evaluating templates
- Package browser dist in npm package

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.8...1.0.0-rc.3)
