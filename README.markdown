[![CI Build Status](https://github.com/handlebars-lang/handlebars.js/actions/workflows/ci.yml/badge.svg)](https://github.com/handlebars-lang/handlebars.js/actions/workflows/ci.yml)
[![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/handlebars/badge?style=rounded)](https://www.jsdelivr.com/package/npm/handlebars)
[![npm downloads](https://badgen.net/npm/dm/handlebars)](https://www.npmjs.com/package/handlebars)
[![npm version](https://badgen.net/npm/v/handlebars)](https://www.npmjs.com/package/handlebars)
[![Bundle size](https://badgen.net/bundlephobia/minzip/handlebars?label=minified%20%2B%20gzipped)](https://bundlephobia.com/package/handlebars)
[![Install size](https://packagephobia.com/badge?p=handlebars)](https://packagephobia.com/result?p=handlebars)

Handlebars.js
=============

Handlebars provides the power necessary to let you build **semantic templates** effectively with no frustration.
Handlebars is largely compatible with Mustache templates. In most cases it is possible to swap out Mustache with Handlebars and continue using your current templates.

Checkout the official Handlebars docs site at
[handlebarsjs.com](https://handlebarsjs.com) and try our [live demo](https://handlebarsjs.com/playground.html).

Installing
----------

See our [installation documentation](https://handlebarsjs.com/installation/).

Usage
-----
In general, the syntax of Handlebars.js templates is a superset
of Mustache templates. For basic syntax, check out the [Mustache
manpage](https://mustache.github.io/mustache.5.html).

Once you have a template, use the `Handlebars.compile` method to compile
the template into a function. The generated function takes a context
argument, which will be used to render the template.

```js
var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
var template = Handlebars.compile(source);

var data = { "name": "Alan", "hometown": "Somewhere, TX",
             "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
var result = template(data);

// Would render:
// <p>Hello, my name is Alan. I am from Somewhere, TX. I have 2 kids:</p>
// <ul>
//   <li>Jimmy is 12</li>
//   <li>Sally is 4</li>
// </ul>
```

Full documentation and more examples are at [handlebarsjs.com](https://handlebarsjs.com/).

Precompiling Templates
----------------------

Handlebars allows templates to be precompiled and included as javascript code rather than the handlebars template allowing for faster startup time. Full details are located [here](https://handlebarsjs.com/installation/precompilation.html).

Differences Between Handlebars.js and Mustache
----------------------------------------------
Handlebars.js adds a couple of additional features to make writing
templates easier and also changes a tiny detail of how partials work.

- [Nested Paths](https://handlebarsjs.com/guide/expressions.html#path-expressions)
- [Helpers](https://handlebarsjs.com/guide/expressions.html#helpers)
- [Block Expressions](https://handlebarsjs.com/guide/block-helpers.html#basic-blocks)
- [Literal Values](https://handlebarsjs.com/guide/expressions.html#literal-segments)
- [Delimited Comments](https://handlebarsjs.com/guide/#template-comments)

Block expressions have the same syntax as mustache sections but should not be confused with one another. Sections are akin to an implicit `each` or `with` statement depending on the input data and helpers are explicit pieces of code that are free to implement whatever behavior they like. The [mustache spec](https://mustache.github.io/mustache.5.html) defines the exact behavior of sections. In the case of name conflicts, helpers are given priority.

### Compatibility

There are a few Mustache behaviors that Handlebars does not implement.
- Handlebars deviates from Mustache slightly in that it does not perform recursive lookup by default. The compile time `compat` flag must be set to enable this functionality. Users should note that there is a performance cost for enabling this flag. The exact cost varies by template, but it's recommended that performance sensitive operations should avoid this mode and instead opt for explicit path references.
- The optional Mustache-style lambdas are not supported. Instead Handlebars provides its own lambda resolution that follows the behaviors of helpers.
- Handlebars does not allow space between the opening `{{` and a command character such as `#`, `/` or `>`. The command character must immediately follow the braces, so for example `{{> partial }}` is allowed but `{{ > partial }}` is not.
- Alternative delimiters are not supported.


Supported Environments
----------------------

Handlebars has been designed to work in any ECMAScript 2020 environment. This includes

- Node.js
- Chrome
- Firefox
- Safari
- Edge

If you need to support older environments, use Handlebars version 4.


Performance
-----------

In a rough performance test, precompiled Handlebars.js templates (in
the original version of Handlebars.js) rendered in about half the
time of Mustache templates. It would be a shame if it were any other
way, since they were precompiled, but the difference in architecture
does have some big performance advantages. Justin Marney, a.k.a.
[gotascii](http://github.com/gotascii), confirmed that with an
[independent test](http://sorescode.com/2010/09/12/benchmarks.html). The
rewritten Handlebars (current version) is faster than the old version,
with many performance tests being 5 to 7 times faster than the Mustache equivalent.


Upgrading
---------

See [release-notes.md](https://github.com/handlebars-lang/handlebars.js/blob/master/release-notes.md) for upgrade notes.

If you are using Handlebars in production, please regularly look for issues labeled
[possibly breaking](https://github.com/handlebars-lang/handlebars.js/issues?q=is%3Aopen+is%3Aissue+label%3A%22possibly+breaking%22).
If this label is applied to an issue, it means that the requested change is probably not a breaking change,
but since Handlebars is widely in use by a lot of people, there's always a chance that it breaks somebody's build.


Known Issues
------------

See [FAQ.md](https://github.com/handlebars-lang/handlebars.js/blob/master/FAQ.md) for known issues and common pitfalls.


Handlebars in the Wild
----------------------

* [apiDoc](https://github.com/apidoc/apidoc) apiDoc uses handlebars as parsing engine for api documentation view generation.
* [Assemble](https://assemble.io), by [@jonschlinkert](https://github.com/jonschlinkert) and [@doowb](https://github.com/doowb), is a static site generator that uses Handlebars.js as its template engine.
* [CoSchedule](https://coschedule.com) An editorial calendar for WordPress that uses Handlebars.js.
* [Ember.js](https://www.emberjs.com) makes Handlebars.js the primary way to structure your views, also with automatic data binding support.
* [express-handlebars](https://github.com/express-handlebars/express-handlebars) A Handlebars view engine for Express which doesn't suck.
* [express-hbs](https://github.com/TryGhost/express-hbs) Express Handlebars template engine with inheritance, partials, i18n and async helpers.
* [Ghost](https://ghost.org/) Just a blogging platform.
* [handlebars-action](https://github.com/marketplace/actions/handlebars-action) A GitHub action to transform files in your repository with Handlebars templating.
* [handlebars_assets](https://github.com/leshill/handlebars_assets) A Rails Asset Pipeline gem from Les Hill (@leshill).
* [handlebars-helpers](https://github.com/assemble/handlebars-helpers) is an extensive library with 100+ handlebars helpers.
* [handlebars-layouts](https://github.com/shannonmoeller/handlebars-layouts) is a set of helpers which implement extensible and embeddable layout blocks as seen in other popular templating languages.
* [handlebars-loader](https://github.com/pcardune/handlebars-loader) A handlebars template loader for webpack.
* [handlebars-wax](https://github.com/shannonmoeller/handlebars-wax) The missing Handlebars API. Effortless registration of data, partials, helpers, and decorators using file-system globs, modules, and plain-old JavaScript objects.
* [hbs](https://github.com/pillarjs/hbs) An Express.js view engine adapter for Handlebars.js, from Don Park.
* [html-bundler-webpack-plugin](https://github.com/webdiscus/html-bundler-webpack-plugin) The webpack plugin to compile templates, [supports Handlebars](https://github.com/webdiscus/html-bundler-webpack-plugin#using-template-handlebars).
* [incremental-bars](https://github.com/atomictag/incremental-bars) adds support for [incremental-dom](https://github.com/google/incremental-dom) as template target to Handlebars.
* [jblotus](https://github.com/jblotus) created [http://tryhandlebarsjs.com](http://tryhandlebarsjs.com) for anyone who would like to try out Handlebars.js in their browser.
* [jQuery plugin](https://71104.github.io/jquery-handlebars/) allows you to use Handlebars.js with [jQuery](http://jquery.com/).
* [just-handlebars-helpers](https://github.com/leapfrogtechnology/just-handlebars-helpers) A fully tested lightweight package with common Handlebars helpers.
* [koa-hbs](https://github.com/jwilm/koa-hbs) [koa](https://github.com/koajs/koa) generator based renderer for Handlebars.js.
* [Marionette.Handlebars](https://github.com/hashchange/marionette.handlebars) adds support for Handlebars and Mustache templates to Marionette.
* [openVALIDATION](https://github.com/openvalidation/openvalidation) a natural language compiler for validation rules. Generates program code in Java, JavaScript, C#, Python and Rust with handlebars.
* [Plop](https://plopjs.com/) is a micro-generator framework that makes it easy to create files with a level of uniformity.
* [promised-handlebars](https://github.com/nknapp/promised-handlebars) is a wrapper for Handlebars that allows helpers to return Promises.
* [sammy.js](https://github.com/quirkey/sammy) by Aaron Quint, a.k.a. quirkey, supports Handlebars.js as one of its template plugins.
* [Swag](https://github.com/elving/swag) by [@elving](https://github.com/elving) is a growing collection of helpers for handlebars.js. Give your handlebars.js templates some swag son!
* [SproutCore](https://www.sproutcore.com) uses Handlebars.js as its main templating engine, extending it with automatic data binding support.
* [vite-plugin-handlebars](https://github.com/alexlafroscia/vite-plugin-handlebars) A package for Vite 2. Allows for running your HTML files through the Handlebars compiler.
* [YUI](https://yuilibrary.com/yui/docs/handlebars/) implements a port of handlebars.

External Resources
------------------

* [Gist about Synchronous and asynchronous loading of external handlebars templates](https://gist.github.com/2287070)

Have a project using Handlebars? Send us a [pull request][pull-request]!

License
-------
Handlebars.js is released under the MIT license.

[pull-request]: https://github.com/handlebars-lang/handlebars.js/pull/new/master
