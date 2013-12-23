/*global CompilerContext, Handlebars, beforeEach, shouldCompileTo */
global.handlebarsEnv = null;

beforeEach(function() {
  global.handlebarsEnv = Handlebars.create();
});

describe("basic context", function() {
  it("most basic", function() {
    shouldCompileTo("{{foo}}", { foo: "foo" }, "foo");
  });

  it("escaping", function() {
    shouldCompileTo("\\{{foo}}", { foo: "food" }, "{{foo}}");
    shouldCompileTo("content \\{{foo}}", { foo: "food" }, "content {{foo}}");
    shouldCompileTo("\\\\{{foo}}", { foo: "food" }, "\\food");
    shouldCompileTo("content \\\\{{foo}}", { foo: "food" }, "content \\food");
    shouldCompileTo("\\\\ {{foo}}", { foo: "food" }, "\\\\ food");
  });

  it("compiling with a basic context", function() {
    shouldCompileTo("Goodbye\n{{cruel}}\n{{world}}!", {cruel: "cruel", world: "world"}, "Goodbye\ncruel\nworld!",
                    "It works if all the required keys are provided");
  });

  it("compiling with an undefined context", function() {
    shouldCompileTo("Goodbye\n{{cruel}}\n{{world.bar}}!", undefined, "Goodbye\n\n!");

    shouldCompileTo("{{#unless foo}}Goodbye{{../test}}{{test2}}{{/unless}}", undefined, "Goodbye");
  });

  it("comments", function() {
    shouldCompileTo("{{! Goodbye}}Goodbye\n{{cruel}}\n{{world}}!",
      {cruel: "cruel", world: "world"}, "Goodbye\ncruel\nworld!",
      "comments are ignored");
  });

  it("boolean", function() {
    var string   = "{{#goodbye}}GOODBYE {{/goodbye}}cruel {{world}}!";
    shouldCompileTo(string, {goodbye: true, world: "world"}, "GOODBYE cruel world!",
                    "booleans show the contents when true");

    shouldCompileTo(string, {goodbye: false, world: "world"}, "cruel world!",
                    "booleans do not show the contents when false");
  });

  it("zeros", function() {
    shouldCompileTo("num1: {{num1}}, num2: {{num2}}", {num1: 42, num2: 0},
        "num1: 42, num2: 0");
    shouldCompileTo("num: {{.}}", 0, "num: 0");
    shouldCompileTo("num: {{num1/num2}}", {num1: {num2: 0}}, "num: 0");
  });

  it("newlines", function() {
      shouldCompileTo("Alan's\nTest", {}, "Alan's\nTest");
      shouldCompileTo("Alan's\rTest", {}, "Alan's\rTest");
  });

  it("escaping text", function() {
    shouldCompileTo("Awesome's", {}, "Awesome's", "text is escaped so that it doesn't get caught on single quotes");
    shouldCompileTo("Awesome\\", {}, "Awesome\\", "text is escaped so that the closing quote can't be ignored");
    shouldCompileTo("Awesome\\\\ foo", {}, "Awesome\\\\ foo", "text is escaped so that it doesn't mess up backslashes");
    shouldCompileTo("Awesome {{foo}}", {foo: '\\'}, "Awesome \\", "text is escaped so that it doesn't mess up backslashes");
    shouldCompileTo(' " " ', {}, ' " " ', "double quotes never produce invalid javascript");
  });

  it("escaping expressions", function() {
   shouldCompileTo("{{{awesome}}}", {awesome: "&\"\\<>"}, '&\"\\<>',
          "expressions with 3 handlebars aren't escaped");

   shouldCompileTo("{{&awesome}}", {awesome: "&\"\\<>"}, '&\"\\<>',
          "expressions with {{& handlebars aren't escaped");

   shouldCompileTo("{{awesome}}", {awesome: "&\"'`\\<>"}, '&amp;&quot;&#x27;&#x60;\\&lt;&gt;',
          "by default expressions should be escaped");

   shouldCompileTo("{{awesome}}", {awesome: "Escaped, <b> looks like: &lt;b&gt;"}, 'Escaped, &lt;b&gt; looks like: &amp;lt;b&amp;gt;',
          "escaping should properly handle amperstands");
  });

  it("functions returning safestrings shouldn't be escaped", function() {
    var hash = {awesome: function() { return new Handlebars.SafeString("&\"\\<>"); }};
    shouldCompileTo("{{awesome}}", hash, '&\"\\<>',
        "functions returning safestrings aren't escaped");
  });

  it("functions", function() {
    shouldCompileTo("{{awesome}}", {awesome: function() { return "Awesome"; }}, "Awesome",
                    "functions are called and render their output");
    shouldCompileTo("{{awesome}}", {awesome: function() { return this.more; }, more:  "More awesome"}, "More awesome",
                    "functions are bound to the context");
  });

  it("functions with context argument", function() {
    shouldCompileTo("{{awesome frank}}",
        {awesome: function(context) { return context; },
          frank: "Frank"},
        "Frank", "functions are called with context arguments");
  });

  it("block functions with context argument", function() {
    shouldCompileTo("{{#awesome 1}}inner {{.}}{{/awesome}}",
        {awesome: function(context, options) { return options.fn(context); }},
        "inner 1", "block functions are called with context and options");
  });

  it("block functions without context argument", function() {
    shouldCompileTo("{{#awesome}}inner{{/awesome}}",
        {awesome: function(options) { return options.fn(this); }},
        "inner", "block functions are called with options");
  });


  it("paths with hyphens", function() {
    shouldCompileTo("{{foo-bar}}", {"foo-bar": "baz"}, "baz", "Paths can contain hyphens (-)");
    shouldCompileTo("{{foo.foo-bar}}", {foo: {"foo-bar": "baz"}}, "baz", "Paths can contain hyphens (-)");
    shouldCompileTo("{{foo/foo-bar}}", {foo: {"foo-bar": "baz"}}, "baz", "Paths can contain hyphens (-)");
  });

  it("nested paths", function() {
    shouldCompileTo("Goodbye {{alan/expression}} world!", {alan: {expression: "beautiful"}},
                    "Goodbye beautiful world!", "Nested paths access nested objects");
  });

  it("nested paths with empty string value", function() {
    shouldCompileTo("Goodbye {{alan/expression}} world!", {alan: {expression: ""}},
                    "Goodbye  world!", "Nested paths access nested objects with empty string");
  });

  it("literal paths", function() {
    shouldCompileTo("Goodbye {{[@alan]/expression}} world!", {"@alan": {expression: "beautiful"}},
        "Goodbye beautiful world!", "Literal paths can be used");
    shouldCompileTo("Goodbye {{[foo bar]/expression}} world!", {"foo bar": {expression: "beautiful"}},
        "Goodbye beautiful world!", "Literal paths can be used");
  });

  it('literal references', function() {
    shouldCompileTo("Goodbye {{[foo bar]}} world!", {"foo bar": "beautiful"},
        "Goodbye beautiful world!", "Literal paths can be used");
  });

  it("that current context path ({{.}}) doesn't hit helpers", function() {
    shouldCompileTo("test: {{.}}", [null, {helper: "awesome"}], "test: ");
  });

  it("complex but empty paths", function() {
    shouldCompileTo("{{person/name}}", {person: {name: null}}, "");
    shouldCompileTo("{{person/name}}", {person: {}}, "");
  });

  it("this keyword in paths", function() {
    var string = "{{#goodbyes}}{{this}}{{/goodbyes}}";
    var hash = {goodbyes: ["goodbye", "Goodbye", "GOODBYE"]};
    shouldCompileTo(string, hash, "goodbyeGoodbyeGOODBYE",
      "This keyword in paths evaluates to current context");

    string = "{{#hellos}}{{this/text}}{{/hellos}}";
    hash = {hellos: [{text: "hello"}, {text: "Hello"}, {text: "HELLO"}]};
    shouldCompileTo(string, hash, "helloHelloHELLO", "This keyword evaluates in more complex paths");
  });

  it("this keyword nested inside path", function() {
    var string = "{{#hellos}}{{text/this/foo}}{{/hellos}}";
    shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error);
  });

  it("this keyword in helpers", function() {
    var helpers = {foo: function(value) {
        return 'bar ' + value;
    }};
    var string = "{{#goodbyes}}{{foo this}}{{/goodbyes}}";
    var hash = {goodbyes: ["goodbye", "Goodbye", "GOODBYE"]};
    shouldCompileTo(string, [hash, helpers], "bar goodbyebar Goodbyebar GOODBYE",
      "This keyword in paths evaluates to current context");

    string = "{{#hellos}}{{foo this/text}}{{/hellos}}";
    hash = {hellos: [{text: "hello"}, {text: "Hello"}, {text: "HELLO"}]};
    shouldCompileTo(string, [hash, helpers], "bar hellobar Hellobar HELLO", "This keyword evaluates in more complex paths");
  });

  it("this keyword nested inside helpers param", function() {
    var string = "{{#hellos}}{{foo text/this/foo}}{{/hellos}}";
    shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error);
  });
});
