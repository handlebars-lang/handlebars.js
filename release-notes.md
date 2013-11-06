# Release Notes

## Development

[Commits](https://github.com/wycats/handlebars.js/compare/v1.1.2...master)

## v1.1.2 - November 5th, 2013

- [#645](https://github.com/wycats/handlebars.js/issues/645) - 1.1.1 fails under IE8 ([@kpdecker](https://api.github.com/users/kpdecker))
- [#644](https://github.com/wycats/handlebars.js/issues/644) - Using precompiled templates (AMD mode) with handlebars.runtime 1.1.1 ([@fddima](https://api.github.com/users/fddima))

- Add simple binary utility tests - 96a45a4
- Fix empty string compilation - eea708a

[Commits](https://github.com/wycats/handlebars.js/compare/v1.1.1...v1.1.2)

## v1.1.1 - November 4th, 2013

- [#642](https://github.com/wycats/handlebars.js/issues/642) - handlebars 1.1.0 are broken with nodejs

- Fix release notes link - 17ba258

[Commits](https://github.com/wycats/handlebars.js/compare/v1.1.0...v1.1.1)

## v1.1.0 - November 3rd, 2013

- [#628](https://github.com/wycats/handlebars.js/pull/628) - Convert code to ES6 modules ([@kpdecker](https://api.github.com/users/kpdecker))
- [#336](https://github.com/wycats/handlebars.js/pull/336) - Add whitespace control syntax ([@kpdecker](https://api.github.com/users/kpdecker))
- [#535](https://github.com/wycats/handlebars.js/pull/535) - Fix for probable JIT error under Safari ([@sorentwo](https://api.github.com/users/sorentwo))
- [#483](https://github.com/wycats/handlebars.js/issues/483) - Add first and last @ vars to each helper ([@denniskuczynski](https://api.github.com/users/denniskuczynski))
- [#557](https://github.com/wycats/handlebars.js/pull/557) - `\\{{foo}}` escaping only works in some situations ([@dmarcotte](https://api.github.com/users/dmarcotte))
- [#552](https://github.com/wycats/handlebars.js/pull/552) - Added BOM removal flag. ([@blessenm](https://api.github.com/users/blessenm))
- [#543](https://github.com/wycats/handlebars.js/pull/543) - publish passing master builds to s3 ([@fivetanley](https://api.github.com/users/fivetanley))

- [#608](https://github.com/wycats/handlebars.js/issues/608) - Add `includeZero` flag to `if` conditional
- [#498](https://github.com/wycats/handlebars.js/issues/498) - `Handlebars.compile` fails on empty string although a single blank works fine
- [#599](https://github.com/wycats/handlebars.js/issues/599) - lambda helpers only receive options if used with arguments
- [#592](https://github.com/wycats/handlebars.js/issues/592) - Optimize array and subprogram performance
- [#571](https://github.com/wycats/handlebars.js/issues/571) - uglify upgrade breaks compatibility with older versions of node
- [#587](https://github.com/wycats/handlebars.js/issues/587) - Partial inside partial breaks?


Compatibility notes:
- The project now includes separate artifacts for AMD, CommonJS, and global objects. 
  - AMD: Users may load the bundled `handlebars.amd.js` or `handlebars.runtime.amd.js` files or load individual modules directly. AMD users should also note that the handlebars object is exposed via the `default` field on the imported object. This [gist](https://gist.github.com/wycats/7417be0dc361a69d5916) provides some discussion of possible compatibility shims.
  - CommonJS/Node: Node loading occurs as normal via `require`
  - Globals: The `handlebars.js` and `handlebars.runtime.js` files should behave in the same manner as the v1.0.12 / 1.0.0 release.
- Build artifacts have been removed from the repository. [npm][npm], [components/handlebars.js][components], [cdnjs][cdnjs], or the [builds page][builds-page] should now be used as the source of built artifacts. 
- Context-stored helpers are now always passed the `options` hash. Previously no-argument helpers did not have this argument.


[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.12...v1.1.0)

## v1.0.12 / 1.0.0 - May 31 2013

- [#515](https://github.com/wycats/handlebars.js/issues/515) - Add node require extensions support ([@jjclark1982](https://github.com/jjclark1982))
- [#517](https://github.com/wycats/handlebars.js/issues/517) - Fix amd precompiler output with directories ([@blessenm](https://github.com/blessenm))
- [#433](https://github.com/wycats/handlebars.js/issues/433) - Add support for unicode ids
- [#469](https://github.com/wycats/handlebars.js/issues/469) - Add support for `?` in ids
- [#534](https://github.com/wycats/handlebars.js/issues/534) - Protect from object prototype modifications
- [#519](https://github.com/wycats/handlebars.js/issues/519) - Fix partials with . name ([@jamesgorrie](https://github.com/jamesgorrie))
- [#519](https://github.com/wycats/handlebars.js/issues/519) - Allow ID or strings in partial names
- [#437](https://github.com/wycats/handlebars.js/issues/437) - Require matching brace counts in escaped expressions
- Merge passed partials and helpers with global namespace values
- Add support for complex ids in @data references
- Docs updates

Compatibility notes:
- The parser is now stricter on `{{{`, requiring that the end token be `}}}`. Templates that do not
  follow this convention should add the additional brace value.
- Code that relies on global the namespace being muted when custom helpers or partials are passed will need to explicitly pass an `undefined` value for any helpers that should not be available.
- The compiler version has changed. Precompiled templates with 1.0.12 or higher must use the 1.0.0 or higher runtime.

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.11...v1.0.12)

## v1.0.11 / 1.0.0-rc4 - May 13 2013

- [#458](https://github.com/wycats/handlebars.js/issues/458) - Fix `./foo` syntax ([@jpfiset](https://github.com/jpfiset))
- [#460](https://github.com/wycats/handlebars.js/issues/460) - Allow `:` in unescaped identifers ([@jpfiset](https://github.com/jpfiset))
- [#471](https://github.com/wycats/handlebars.js/issues/471) - Create release notes (These!)
- [#456](https://github.com/wycats/handlebars.js/issues/456) - Allow escaping of `\\`
- [#211](https://github.com/wycats/handlebars.js/issues/211) - Fix exception in `escapeExpression`
- [#375](https://github.com/wycats/handlebars.js/issues/375) - Escape unicode newlines
- [#461](https://github.com/wycats/handlebars.js/issues/461) - Do not fail when compiling `""`
- [#302](https://github.com/wycats/handlebars.js/issues/302) - Fix sanity check in knownHelpersOnly mode
- [#369](https://github.com/wycats/handlebars.js/issues/369) - Allow registration of multiple helpers and partial by passing definition object
- Add bower package declaration ([@DevinClark](https://github.com/DevinClark))
- Add NuSpec package declaration ([@MikeMayer](https://github.com/MikeMayer))
- Handle empty context in `with` ([@thejohnfreeman](https://github.com/thejohnfreeman))
- Support custom template extensions in CLI ([@matteoagosti](https://github.com/matteoagosti))
- Fix Rhino support ([@broady](https://github.com/broady))
- Include contexts in string mode ([@leshill](https://github.com/leshill))
- Return precompiled scripts when compiling to AMD ([@JamesMaroney](https://github.com/JamesMaroney))
- Docs updates ([@iangreenleaf](https://github.com/iangreenleaf), [@gilesbowkett](https://github.com/gilesbowkett), [@utkarsh2012](https://github.com/utkarsh2012))
- Fix `toString` handling under IE and browserify ([@tommydudebreaux](https://github.com/tommydudebreaux))
- Add program metadata

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.10...v1.0.11)

## v1.0.10 - Node - Feb 27 2013

- [#428](https://github.com/wycats/handlebars.js/issues/428) - Fix incorrect rendering of nested programs
- Fix exception message ([@tricknotes](https://github.com/tricknotes))
- Added negative number literal support
- Concert library to single IIFE
- Add handlebars-source gemspec ([@machty](https://github.com/machty))

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.9...v1.0.10)

## v1.0.9 - Node - Feb 15 2013

- Added `Handlebars.create` API in node module for sandboxed instances ([@tommydudebreaux](https://github.com/tommydudebreaux))

[Commits](https://github.com/wycats/handlebars.js/compare/1.0.0-rc.3...v1.0.9)

## 1.0.0-rc3 - Browser - Feb 14 2013

- Prevent use of `this` or `..` in illogical place ([@leshill](https://github.com/leshill))
- Allow AST passing for `parse`/`compile`/`precompile` ([@machty](https://github.com/machty))
- Optimize generated output by inlining statements where possible
- Check compiler version when evaluating templates
- Package browser dist in npm package

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.8...1.0.0-rc.3)

## Prior Versions

When upgrading from the Handlebars 0.9 series, be aware that the
signature for passing custom helpers or partials to templates has
changed.

Instead of:

```js
template(context, helpers, partials, [data])
```

Use:

```js
template(context, {helpers: helpers, partials: partials, data: data})
```

[builds-page]: http://builds.handlebarsjs.com.s3.amazonaws.com/index.html
[cdnjs]: http://cdnjs.com/libraries/handlebars.js/
[components]: https://github.com/components/handlebars.js
[npm]: https://npmjs.org/package/handlebars
