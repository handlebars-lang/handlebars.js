# Frequently Asked Questions

## How can I file a bug report:

See our guidelines on [reporting issues](https://github.com/handlebars-lang/handlebars.js/blob/master/CONTRIBUTING.md#reporting-issues).

## Why isn't my Mustache template working?

Handlebars deviates from Mustache slightly on a few behaviors. These variations are documented in our [readme](https://github.com/handlebars-lang/handlebars.js#differences-between-handlebarsjs-and-mustache).

## Why is it slower when compiling?

The Handlebars compiler must parse the template and construct a JavaScript program which can then be run. Under some environments such as older mobile devices this can have a performance impact which can be avoided by precompiling. Generally it's recommended that precompilation and the runtime library be used on all clients.

## Why doesn't this work with Content Security Policy restrictions?

When not using the precompiler, Handlebars generates a dynamic function for each template which can cause issues with pages that have enabled Content Policy. It's recommended that templates are precompiled or the `unsafe-eval` policy is enabled for sites that must generate dynamic templates at runtime.

## How can I include script tags in my template?

If loading the template via an inlined `<script type="text/x-handlebars">` tag then you may need to break up the script tag with an empty comment to avoid browser parser errors:

```html
<script type="text/x-handlebars">
  foo
  <scr{{!}}ipt src="bar"></scr{{!}}ipt>
</script>
```

It's generally recommended that templates are served through external, precompiled, files, which do not suffer from this issue.

## Why are my precompiled scripts throwing exceptions?

When using the precompiler, it's important that a supporting version of the Handlebars runtime be loaded on the target page. In version 1.x there were rudimentary checks to compare the version but these did not always work. This is fixed under 2.x but the version checking does not work between these two versions. If you see unexpected errors such as `undefined is not a function` or similar, please verify that the same version is being used for both the precompiler and the client. This can be checked via:

```sh
handlebars --version
```

If using the integrated precompiler and

```javascript
console.log(Handlebars.VERSION);
```

On the client side.

We include the built client libraries in the npm package for those who want to be certain that they are using the same client libraries as the compiler.

Should these match, please file an issue with us, per our [issue filing guidelines](https://github.com/handlebars-lang/handlebars.js/blob/master/CONTRIBUTING.md#reporting-issues).

## How do I load the runtime library when using AMD?

The `handlebars.runtime.js` file includes a UMD build, which exposes the library as both the module root and the `default` field for compatibility.
