# Frequently Asked Questions

1. How can I file a bug report:
  Please don't hesitate to let us know if you find something wrong! In general we are going to ask for an example of the problem failing, which can be as simple as a jsfiddle/jsbin/etc. We've put together a jsfiddle [template](http://jsfiddle.net/9D88g/11/) to ease this. (We will keep this link up to date as new releases occur, so feel free to check back here)

1. Why is it slower when compiling?
  The Handlebars compiler must parse the template and construct a JavaScript program which can then be run. Under some environments such as older mobile devices this can have a performance impact which can be avoided by precompiling. Generally it's recommended that precompilation and the runtime library be used on all clients.

1. Why doesn't this work with Content Security Policy restrictions?
  Handlebars generates a dynamic function for each template which can cause issues with pages that have enabled Content Policy. It's recommended that templates are precompiled or the `unsafe-eval` policy is enabled for sites that must generate dynamic templates at runtime.

1. How can I include script tags in my template?
  If loading the template via an inlined `<script type="text/x-handlebars">` tag then you may need to break up the script tag with an empty comment to avoid browser parser errors:

```
  <script type="text/x-handlebars">
    foo
    <scr{{!}}ipt src="bar"></scr{{!}}ipt>
  </script>
```

  It's generally recommended that templates are served through external, precompiled, files, which do not suffer from this issue.
