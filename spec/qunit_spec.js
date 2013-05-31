var Handlebars;
if (!Handlebars) {
  // Setup for Node package testing
  Handlebars = require('../lib/handlebars');

  var assert = require("assert"),

      equal = assert.equal,
      equals = assert.equal,
      ok = assert.ok;

  // Note that this doesn't have the same context separation as the rspec test.
  // Both should be run for full acceptance of the two libary modes.
  var CompilerContext = {
    compile: function(template, options) {
      var templateSpec = Handlebars.precompile(template, options);
      return Handlebars.template(eval('(' + templateSpec + ')'));
    },
    compileWithPartial: function(template, options) {
      return Handlebars.compile(template, options);
    }
  };
} else {
  var _equal = equal;
  equals = equal = function(a, b, msg) {
    // Allow exec with missing message params
    _equal(a, b, msg || '');
  };
}

suite("basic context");

function shouldCompileTo(string, hashOrArray, expected, message) {
  shouldCompileToWithPartials(string, hashOrArray, false, expected, message);
}

function shouldCompileToWithPartials(string, hashOrArray, partials, expected, message) {
  var result = compileWithPartials(string, hashOrArray, partials);
  equal(result, expected, "'" + expected + "' should === '" + result + "': " + message);
}

function compileWithPartials(string, hashOrArray, partials) {
  var template = CompilerContext[partials ? 'compileWithPartial' : 'compile'](string), ary;
  if(Object.prototype.toString.call(hashOrArray) === "[object Array]") {
    ary = [];
    ary.push(hashOrArray[0]);
    ary.push({ helpers: hashOrArray[1], partials: hashOrArray[2] });
  } else {
    ary = [hashOrArray];
  }

  return template.apply(this, ary);
}

function shouldThrow(fn, exception, message) {
  var caught = false,
      exType, exMessage;

  if (exception instanceof Array) {
    exType = exception[0];
    exMessage = exception[1];
  } else if (typeof exception === 'string') {
    exType = Error;
    exMessage = exception;
  } else {
    exType = exception;
  }

  try {
    fn();
  }
  catch (e) {
    if (e instanceof exType) {
      if (!exMessage || e.message === exMessage) {
        caught = true;
      }
    }
  }

  ok(caught, message || null);
}

test("most basic", function() {
  shouldCompileTo("{{foo}}", { foo: "foo" }, "foo");
});

test("escaping", function() {
  shouldCompileTo("\\{{foo}}", { foo: "food" }, "{{foo}}");
  shouldCompileTo("\\\\{{foo}}", { foo: "food" }, "\\food");
  shouldCompileTo("\\\\ {{foo}}", { foo: "food" }, "\\\\ food");
});

test("compiling with a basic context", function() {
  shouldCompileTo("Goodbye\n{{cruel}}\n{{world}}!", {cruel: "cruel", world: "world"}, "Goodbye\ncruel\nworld!",
                  "It works if all the required keys are provided");
});

test("comments", function() {
  shouldCompileTo("{{! Goodbye}}Goodbye\n{{cruel}}\n{{world}}!",
    {cruel: "cruel", world: "world"}, "Goodbye\ncruel\nworld!",
    "comments are ignored");
});

test("boolean", function() {
  var string   = "{{#goodbye}}GOODBYE {{/goodbye}}cruel {{world}}!";
  shouldCompileTo(string, {goodbye: true, world: "world"}, "GOODBYE cruel world!",
                  "booleans show the contents when true");

  shouldCompileTo(string, {goodbye: false, world: "world"}, "cruel world!",
                  "booleans do not show the contents when false");
});

test("zeros", function() {
  shouldCompileTo("num1: {{num1}}, num2: {{num2}}", {num1: 42, num2: 0},
      "num1: 42, num2: 0");
	shouldCompileTo("num: {{.}}", 0, "num: 0");
	shouldCompileTo("num: {{num1/num2}}", {num1: {num2: 0}}, "num: 0");
});

test("newlines", function() {
    shouldCompileTo("Alan's\nTest", {}, "Alan's\nTest");
    shouldCompileTo("Alan's\rTest", {}, "Alan's\rTest");
});

test("escaping text", function() {
  shouldCompileTo("Awesome's", {}, "Awesome's", "text is escaped so that it doesn't get caught on single quotes");
  shouldCompileTo("Awesome\\", {}, "Awesome\\", "text is escaped so that the closing quote can't be ignored");
  shouldCompileTo("Awesome\\\\ foo", {}, "Awesome\\\\ foo", "text is escaped so that it doesn't mess up backslashes");
  shouldCompileTo("Awesome {{foo}}", {foo: '\\'}, "Awesome \\", "text is escaped so that it doesn't mess up backslashes");
  shouldCompileTo(' " " ', {}, ' " " ', "double quotes never produce invalid javascript");
});

test("escaping expressions", function() {
 shouldCompileTo("{{{awesome}}}", {awesome: "&\"\\<>"}, '&\"\\<>',
        "expressions with 3 handlebars aren't escaped");

 shouldCompileTo("{{&awesome}}", {awesome: "&\"\\<>"}, '&\"\\<>',
        "expressions with {{& handlebars aren't escaped");

 shouldCompileTo("{{awesome}}", {awesome: "&\"'`\\<>"}, '&amp;&quot;&#x27;&#x60;\\&lt;&gt;',
        "by default expressions should be escaped");

 shouldCompileTo("{{awesome}}", {awesome: "Escaped, <b> looks like: &lt;b&gt;"}, 'Escaped, &lt;b&gt; looks like: &amp;lt;b&amp;gt;',
        "escaping should properly handle amperstands");
});

test("functions returning safestrings shouldn't be escaped", function() {
  var hash = {awesome: function() { return new Handlebars.SafeString("&\"\\<>"); }};
  shouldCompileTo("{{awesome}}", hash, '&\"\\<>',
      "functions returning safestrings aren't escaped");
});

test("functions", function() {
  shouldCompileTo("{{awesome}}", {awesome: function() { return "Awesome"; }}, "Awesome",
                  "functions are called and render their output");
  shouldCompileTo("{{awesome}}", {awesome: function() { return this.more; }, more:  "More awesome"}, "More awesome",
                  "functions are bound to the context");
});

test("functions with context argument", function() {
  shouldCompileTo("{{awesome frank}}",
      {awesome: function(context) { return context; },
        frank: "Frank"},
      "Frank", "functions are called with context arguments");
});


test("paths with hyphens", function() {
  shouldCompileTo("{{foo-bar}}", {"foo-bar": "baz"}, "baz", "Paths can contain hyphens (-)");
  shouldCompileTo("{{foo.foo-bar}}", {foo: {"foo-bar": "baz"}}, "baz", "Paths can contain hyphens (-)");
  shouldCompileTo("{{foo/foo-bar}}", {foo: {"foo-bar": "baz"}}, "baz", "Paths can contain hyphens (-)");
});

test("nested paths", function() {
  shouldCompileTo("Goodbye {{alan/expression}} world!", {alan: {expression: "beautiful"}},
                  "Goodbye beautiful world!", "Nested paths access nested objects");
});

test("nested paths with empty string value", function() {
  shouldCompileTo("Goodbye {{alan/expression}} world!", {alan: {expression: ""}},
                  "Goodbye  world!", "Nested paths access nested objects with empty string");
});

test("literal paths", function() {
  shouldCompileTo("Goodbye {{[@alan]/expression}} world!", {"@alan": {expression: "beautiful"}},
      "Goodbye beautiful world!", "Literal paths can be used");
  shouldCompileTo("Goodbye {{[foo bar]/expression}} world!", {"foo bar": {expression: "beautiful"}},
      "Goodbye beautiful world!", "Literal paths can be used");
});

test('literal references', function() {
  shouldCompileTo("Goodbye {{[foo bar]}} world!", {"foo bar": "beautiful"},
      "Goodbye beautiful world!", "Literal paths can be used");
});

test("that current context path ({{.}}) doesn't hit helpers", function() {
	shouldCompileTo("test: {{.}}", [null, {helper: "awesome"}], "test: ");
});

test("complex but empty paths", function() {
  shouldCompileTo("{{person/name}}", {person: {name: null}}, "");
  shouldCompileTo("{{person/name}}", {person: {}}, "");
});

test("this keyword in paths", function() {
  var string = "{{#goodbyes}}{{this}}{{/goodbyes}}";
  var hash = {goodbyes: ["goodbye", "Goodbye", "GOODBYE"]};
  shouldCompileTo(string, hash, "goodbyeGoodbyeGOODBYE",
    "This keyword in paths evaluates to current context");

  string = "{{#hellos}}{{this/text}}{{/hellos}}";
  hash = {hellos: [{text: "hello"}, {text: "Hello"}, {text: "HELLO"}]};
  shouldCompileTo(string, hash, "helloHelloHELLO", "This keyword evaluates in more complex paths");
});

test("this keyword nested inside path", function() {
  var string = "{{#hellos}}{{text/this/foo}}{{/hellos}}";
  shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error, "Should throw exception");
});

test("this keyword in helpers", function() {
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

test("this keyword nested inside helpers param", function() {
  var string = "{{#hellos}}{{foo text/this/foo}}{{/hellos}}";
  shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error, "Should throw exception");
});

suite("inverted sections");

test("inverted sections with unset value", function() {
  var string = "{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}";
  var hash = {};
  shouldCompileTo(string, hash, "Right On!", "Inverted section rendered when value isn't set.");
});

test("inverted section with false value", function() {
  var string = "{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}";
  var hash = {goodbyes: false};
  shouldCompileTo(string, hash, "Right On!", "Inverted section rendered when value is false.");
});

test("inverted section with empty set", function() {
  var string = "{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}";
  var hash = {goodbyes: []};
  shouldCompileTo(string, hash, "Right On!", "Inverted section rendered when value is empty set.");
});

suite("blocks");

test("array", function() {
  var string   = "{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!";
  var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
  shouldCompileTo(string, hash, "goodbye! Goodbye! GOODBYE! cruel world!",
                  "Arrays iterate over the contents when not empty");

  shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                  "Arrays ignore the contents when empty");

});

test("array with @index", function() {
  var string = "{{#goodbyes}}{{@index}}. {{text}}! {{/goodbyes}}cruel {{world}}!";
  var hash   = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};

  var template = CompilerContext.compile(string);
  var result = template(hash);

  equal(result, "0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!", "The @index variable is used");
});

test("empty block", function() {
  var string   = "{{#goodbyes}}{{/goodbyes}}cruel {{world}}!";
  var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
  shouldCompileTo(string, hash, "cruel world!",
                  "Arrays iterate over the contents when not empty");

  shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                  "Arrays ignore the contents when empty");
});

test("nested iteration", function() {

});

test("block with complex lookup", function() {
  var string = "{{#goodbyes}}{{text}} cruel {{../name}}! {{/goodbyes}}";
  var hash     = {name: "Alan", goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}]};

  shouldCompileTo(string, hash, "goodbye cruel Alan! Goodbye cruel Alan! GOODBYE cruel Alan! ",
                  "Templates can access variables in contexts up the stack with relative path syntax");
});

test("block with complex lookup using nested context", function() {
  var string = "{{#goodbyes}}{{text}} cruel {{foo/../name}}! {{/goodbyes}}";

  shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error, "Should throw exception");
});

test("helper with complex lookup$", function() {
  var string = "{{#goodbyes}}{{{link ../prefix}}}{{/goodbyes}}";
  var hash = {prefix: "/root", goodbyes: [{text: "Goodbye", url: "goodbye"}]};
  var helpers = {link: function(prefix) {
    return "<a href='" + prefix + "/" + this.url + "'>" + this.text + "</a>";
  }};
  shouldCompileTo(string, [hash, helpers], "<a href='/root/goodbye'>Goodbye</a>");
});

test("helper block with complex lookup expression", function() {
  var string = "{{#goodbyes}}{{../name}}{{/goodbyes}}";
  var hash = {name: "Alan"};
  var helpers = {goodbyes: function(options) {
		var out = "";
		var byes = ["Goodbye", "goodbye", "GOODBYE"];
		for (var i = 0,j = byes.length; i < j; i++) {
			out += byes[i] + " " + options.fn(this) + "! ";
		}
    return out;
  }};
  shouldCompileTo(string, [hash, helpers], "Goodbye Alan! goodbye Alan! GOODBYE Alan! ");
});

test("helper with complex lookup and nested template", function() {
  var string = "{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}";
  var hash = {prefix: '/root', goodbyes: [{text: "Goodbye", url: "goodbye"}]};
  var helpers = {link: function (prefix, options) {
      return "<a href='" + prefix + "/" + this.url + "'>" + options.fn(this) + "</a>";
  }};
  shouldCompileToWithPartials(string, [hash, helpers], false, "<a href='/root/goodbye'>Goodbye</a>");
});

test("helper with complex lookup and nested template in VM+Compiler", function() {
  var string = "{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}";
  var hash = {prefix: '/root', goodbyes: [{text: "Goodbye", url: "goodbye"}]};
  var helpers = {link: function (prefix, options) {
      return "<a href='" + prefix + "/" + this.url + "'>" + options.fn(this) + "</a>";
  }};
  shouldCompileToWithPartials(string, [hash, helpers], true, "<a href='/root/goodbye'>Goodbye</a>");
});

test("block with deep nested complex lookup", function() {
  var string = "{{#outer}}Goodbye {{#inner}}cruel {{../../omg}}{{/inner}}{{/outer}}";
  var hash = {omg: "OMG!", outer: [{ inner: [{ text: "goodbye" }] }] };

  shouldCompileTo(string, hash, "Goodbye cruel OMG!");
});

test("block helper", function() {
  var string   = "{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!";
  var template = CompilerContext.compile(string);

  var result = template({world: "world"}, { helpers: {goodbyes: function(options) { return options.fn({text: "GOODBYE"}); }}});
  equal(result, "GOODBYE! cruel world!", "Block helper executed");
});

test("block helper staying in the same context", function() {
  var string   = "{{#form}}<p>{{name}}</p>{{/form}}";
  var template = CompilerContext.compile(string);

  var result = template({name: "Yehuda"}, {helpers: {form: function(options) { return "<form>" + options.fn(this) + "</form>"; } }});
  equal(result, "<form><p>Yehuda</p></form>", "Block helper executed with current context");
});

test("block helper should have context in this", function() {
  var source = "<ul>{{#people}}<li>{{#link}}{{name}}{{/link}}</li>{{/people}}</ul>";
  var link = function(options) {
    return '<a href="/people/' + this.id + '">' + options.fn(this) + '</a>';
  };
  var data = { "people": [
    { "name": "Alan", "id": 1 },
    { "name": "Yehuda", "id": 2 }
  ]};

  shouldCompileTo(source, [data, {link: link}], "<ul><li><a href=\"/people/1\">Alan</a></li><li><a href=\"/people/2\">Yehuda</a></li></ul>");
});

test("block helper for undefined value", function() {
	shouldCompileTo("{{#empty}}shouldn't render{{/empty}}", {}, "");
});

test("block helper passing a new context", function() {
  var string   = "{{#form yehuda}}<p>{{name}}</p>{{/form}}";
  var template = CompilerContext.compile(string);

  var result = template({yehuda: {name: "Yehuda"}}, { helpers: {form: function(context, options) { return "<form>" + options.fn(context) + "</form>"; }}});
  equal(result, "<form><p>Yehuda</p></form>", "Context variable resolved");
});

test("block helper passing a complex path context", function() {
  var string   = "{{#form yehuda/cat}}<p>{{name}}</p>{{/form}}";
  var template = CompilerContext.compile(string);

  var result = template({yehuda: {name: "Yehuda", cat: {name: "Harold"}}}, { helpers: {form: function(context, options) { return "<form>" + options.fn(context) + "</form>"; }}});
  equal(result, "<form><p>Harold</p></form>", "Complex path variable resolved");
});

test("nested block helpers", function() {
  var string   = "{{#form yehuda}}<p>{{name}}</p>{{#link}}Hello{{/link}}{{/form}}";
  var template = CompilerContext.compile(string);

  var result = template({
    yehuda: {name: "Yehuda" }
  }, {
    helpers: {
      link: function(options) { return "<a href='" + this.name + "'>" + options.fn(this) + "</a>"; },
      form: function(context, options) { return "<form>" + options.fn(context) + "</form>"; }
    }
  });
  equal(result, "<form><p>Yehuda</p><a href='Yehuda'>Hello</a></form>", "Both blocks executed");
});

test("block inverted sections", function() {
  shouldCompileTo("{{#people}}{{name}}{{^}}{{none}}{{/people}}", {none: "No people"},
    "No people");
});

test("block inverted sections with empty arrays", function() {
  shouldCompileTo("{{#people}}{{name}}{{^}}{{none}}{{/people}}", {none: "No people", people: []},
    "No people");
});

test("block helper inverted sections", function() {
  var string = "{{#list people}}{{name}}{{^}}<em>Nobody's here</em>{{/list}}";
  var list = function(context, options) {
    if (context.length > 0) {
      var out = "<ul>";
      for(var i = 0,j=context.length; i < j; i++) {
        out += "<li>";
        out += options.fn(context[i]);
        out += "</li>";
      }
      out += "</ul>";
      return out;
    } else {
      return "<p>" + options.inverse(this) + "</p>";
    }
  };

  var hash = {people: [{name: "Alan"}, {name: "Yehuda"}]};
  var empty = {people: []};
  var rootMessage = {
    people: [],
    message: "Nobody's here"
  };

  var messageString = "{{#list people}}Hello{{^}}{{message}}{{/list}}";

  // the meaning here may be kind of hard to catch, but list.not is always called,
  // so we should see the output of both
  shouldCompileTo(string, [hash, { list: list }], "<ul><li>Alan</li><li>Yehuda</li></ul>", "an inverse wrapper is passed in as a new context");
  shouldCompileTo(string, [empty, { list: list }], "<p><em>Nobody's here</em></p>", "an inverse wrapper can be optionally called");
  shouldCompileTo(messageString, [rootMessage, { list: list }], "<p>Nobody&#x27;s here</p>", "the context of an inverse is the parent of the block");
});

suite("helpers hash");

test("providing a helpers hash", function() {
  shouldCompileTo("Goodbye {{cruel}} {{world}}!", [{cruel: "cruel"}, {world: function() { return "world"; }}], "Goodbye cruel world!",
                  "helpers hash is available");

  shouldCompileTo("Goodbye {{#iter}}{{cruel}} {{world}}{{/iter}}!", [{iter: [{cruel: "cruel"}]}, {world: function() { return "world"; }}],
                  "Goodbye cruel world!", "helpers hash is available inside other blocks");
});

test("in cases of conflict, helpers win", function() {
  shouldCompileTo("{{{lookup}}}", [{lookup: 'Explicit'}, {lookup: function() { return 'helpers'; }}], "helpers",
                  "helpers hash has precedence escaped expansion");
  shouldCompileTo("{{lookup}}", [{lookup: 'Explicit'}, {lookup: function() { return 'helpers'; }}], "helpers",
                  "helpers hash has precedence simple expansion");
});

test("the helpers hash is available is nested contexts", function() {
  shouldCompileTo("{{#outer}}{{#inner}}{{helper}}{{/inner}}{{/outer}}",
                [{'outer': {'inner': {'unused':[]}}},  {'helper': function() { return 'helper'; }}], "helper",
                "helpers hash is available in nested contexts.");
});

test("the helper hash should augment the global hash", function() {
  Handlebars.registerHelper('test_helper', function() { return 'found it!'; });

  shouldCompileTo(
    "{{test_helper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}", [
      {cruel: "cruel"},
      {world: function() { return "world!"; }}
    ],
    "found it! Goodbye cruel world!!");
});

test("Multiple global helper registration", function() {
  var helpers = Handlebars.helpers;
  try {
    Handlebars.helpers = {};
    Handlebars.registerHelper({
      'if': helpers['if'],
      world: function() { return "world!"; },
      test_helper: function() { return 'found it!'; }
    });

    shouldCompileTo(
      "{{test_helper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}",
      [{cruel: "cruel"}],
      "found it! Goodbye cruel world!!");
  } finally {
    if (helpers) {
      Handlebars.helpers = helpers;
    }
  }
});

suite("partials");

test("basic partials", function() {
  var string = "Dudes: {{#dudes}}{{> dude}}{{/dudes}}";
  var partial = "{{name}} ({{url}}) ";
  var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
  shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                  "Basic partials output based on current context.");
});

test("partials with context", function() {
  var string = "Dudes: {{>dude dudes}}";
  var partial = "{{#this}}{{name}} ({{url}}) {{/this}}";
  var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
  shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                  "Partials can be passed a context");
});

test("partial in a partial", function() {
  var string = "Dudes: {{#dudes}}{{>dude}}{{/dudes}}";
  var dude = "{{name}} {{> url}} ";
  var url = "<a href='{{url}}'>{{url}}</a>";
  var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
  shouldCompileToWithPartials(string, [hash, {}, {dude: dude, url: url}], true, "Dudes: Yehuda <a href='http://yehuda'>http://yehuda</a> Alan <a href='http://alan'>http://alan</a> ", "Partials are rendered inside of other partials");
});

test("rendering undefined partial throws an exception", function() {
  shouldThrow(function() {
      var template = CompilerContext.compile("{{> whatever}}");
      template();
    }, [Handlebars.Exception, 'The partial whatever could not be found'], "Should throw exception");
});

test("rendering template partial in vm mode throws an exception", function() {
  shouldThrow(function() {
      var template = CompilerContext.compile("{{> whatever}}");
      template();
    }, [Handlebars.Exception, 'The partial whatever could not be found'], "Should throw exception");
});

test("rendering function partial in vm mode", function() {
  var string = "Dudes: {{#dudes}}{{> dude}}{{/dudes}}";
  var partial = function(context) {
    return context.name + ' (' + context.url + ') ';
  };
  var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
  shouldCompileTo(string, [hash, {}, {dude: partial}], "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                  "Function partials output based in VM.");
});

test("GH-14: a partial preceding a selector", function() {
   var string = "Dudes: {{>dude}} {{another_dude}}";
   var dude = "{{name}}";
   var hash = {name:"Jeepers", another_dude:"Creepers"};
   shouldCompileToWithPartials(string, [hash, {}, {dude:dude}], true, "Dudes: Jeepers Creepers", "Regular selectors can follow a partial");
});

test("Partials with slash paths", function() {
	var string = "Dudes: {{> shared/dude}}";
	var dude = "{{name}}";
	var hash = {name:"Jeepers", another_dude:"Creepers"};
  shouldCompileToWithPartials(string, [hash, {}, {'shared/dude':dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
});

test("Partials with slash and point paths", function() {
  var string = "Dudes: {{> shared/dude.thing}}";
  var dude = "{{name}}";
  var hash = {name:"Jeepers", another_dude:"Creepers"};
  shouldCompileToWithPartials(string, [hash, {}, {'shared/dude.thing':dude}], true, "Dudes: Jeepers", "Partials can use literal with points in paths");
});

test("Global Partials", function() {
  Handlebars.registerPartial('global_test', '{{another_dude}}');

  var string = "Dudes: {{> shared/dude}} {{> global_test}}";
  var dude = "{{name}}";
  var hash = {name:"Jeepers", another_dude:"Creepers"};
  shouldCompileToWithPartials(string, [hash, {}, {'shared/dude':dude}], true, "Dudes: Jeepers Creepers", "Partials can use globals or passed");
});

test("Multiple partial registration", function() {
  Handlebars.registerPartial({
    'shared/dude': '{{name}}',
    global_test: '{{another_dude}}'
  });

  var string = "Dudes: {{> shared/dude}} {{> global_test}}";
  var hash = {name:"Jeepers", another_dude:"Creepers"};
  shouldCompileToWithPartials(string, [hash], true, "Dudes: Jeepers Creepers", "Partials can use globals or passed");
});

test("Partials with integer path", function() {
	var string = "Dudes: {{> 404}}";
	var dude = "{{name}}";
	var hash = {name:"Jeepers", another_dude:"Creepers"};
  shouldCompileToWithPartials(string, [hash, {}, {404:dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
});

test("Partials with complex path", function() {
  var string = "Dudes: {{> 404/asdf?.bar}}";
  var dude = "{{name}}";
  var hash = {name:"Jeepers", another_dude:"Creepers"};
  shouldCompileToWithPartials(string, [hash, {}, {'404/asdf?.bar':dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
});

test("Partials with escaped", function() {
  var string = "Dudes: {{> [+404/asdf?.bar]}}";
  var dude = "{{name}}";
  var hash = {name:"Jeepers", another_dude:"Creepers"};
  shouldCompileToWithPartials(string, [hash, {}, {'+404/asdf?.bar':dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
});

test("Partials with string", function() {
  var string = "Dudes: {{> \"+404/asdf?.bar\"}}";
  var dude = "{{name}}";
  var hash = {name:"Jeepers", another_dude:"Creepers"};
  shouldCompileToWithPartials(string, [hash, {}, {'+404/asdf?.bar':dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
});

suite("String literal parameters");

test("simple literals work", function() {
  var string   = 'Message: {{hello "world" 12 true false}}';
  var hash     = {};
  var helpers  = {hello: function(param, times, bool1, bool2) {
    if(typeof times !== 'number') { times = "NaN"; }
    if(typeof bool1 !== 'boolean') { bool1 = "NaB"; }
    if(typeof bool2 !== 'boolean') { bool2 = "NaB"; }
    return "Hello " + param + " " + times + " times: " + bool1 + " " + bool2;
  }};
  shouldCompileTo(string, [hash, helpers], "Message: Hello world 12 times: true false", "template with a simple String literal");
});
test("negative number literals work", function() {
  var string   = 'Message: {{hello -12}}';
  var hash     = {};
  var helpers  = {hello: function(times) {
    if(typeof times !== 'number') { times = "NaN"; }
    return "Hello " + times + " times";
  }};
  shouldCompileTo(string, [hash, helpers], "Message: Hello -12 times", "template with a negative integer literal");
});


test("using a quote in the middle of a parameter raises an error", function() {
  shouldThrow(function() {
    var string   = 'Message: {{hello wo"rld"}}';
    CompilerContext.compile(string);
  }, Error, "should throw exception");
});

test("escaping a String is possible", function(){
  var string   = 'Message: {{{hello "\\"world\\""}}}';
  var hash     = {};
  var helpers = {hello: function(param) { return "Hello " + param; }};
  shouldCompileTo(string, [hash, helpers], "Message: Hello \"world\"", "template with an escaped String literal");
});

test("it works with ' marks", function() {
  var string   = 'Message: {{{hello "Alan\'s world"}}}';
  var hash     = {};
  var helpers = {hello: function(param) { return "Hello " + param; }};
  shouldCompileTo(string, [hash, helpers], "Message: Hello Alan's world", "template with a ' mark");
});

suite("multiple parameters");

test("simple multi-params work", function() {
  var string   = 'Message: {{goodbye cruel world}}';
  var hash     = {cruel: "cruel", world: "world"};
  var helpers = {goodbye: function(cruel, world) { return "Goodbye " + cruel + " " + world; }};
  shouldCompileTo(string, [hash, helpers], "Message: Goodbye cruel world", "regular helpers with multiple params");
});

test("block multi-params work", function() {
  var string   = 'Message: {{#goodbye cruel world}}{{greeting}} {{adj}} {{noun}}{{/goodbye}}';
  var hash     = {cruel: "cruel", world: "world"};
  var helpers = {goodbye: function(cruel, world, options) {
    return options.fn({greeting: "Goodbye", adj: cruel, noun: world});
  }};
  shouldCompileTo(string, [hash, helpers], "Message: Goodbye cruel world", "block helpers with multiple params");
});

suite("safestring");

test("constructing a safestring from a string and checking its type", function() {
  var safe = new Handlebars.SafeString("testing 1, 2, 3");
  ok(safe instanceof Handlebars.SafeString, "SafeString is an instance of Handlebars.SafeString");
  equal(safe, "testing 1, 2, 3", "SafeString is equivalent to its underlying string");
});

test("it should not escape SafeString properties", function() {
  var name = new Handlebars.SafeString("<em>Sean O&#x27;Malley</em>");

  shouldCompileTo('{{name}}', [{ name: name }], "<em>Sean O&#x27;Malley</em>");
});

suite("helperMissing");

test("if a context is not found, helperMissing is used", function() {
  shouldThrow(function() {
      var template = CompilerContext.compile("{{hello}} {{link_to world}}");
      template({});
    }, [Error, "Missing helper: 'link_to'"], "Should throw exception");
});

test("if a context is not found, custom helperMissing is used", function() {
  var string = "{{hello}} {{link_to world}}";
  var context = { hello: "Hello", world: "world" };

  var helpers = {
    helperMissing: function(helper, context) {
      if(helper === "link_to") {
        return new Handlebars.SafeString("<a>" + context + "</a>");
      }
    }
  };

  shouldCompileTo(string, [context, helpers], "Hello <a>world</a>");
});

suite("knownHelpers");

test("Known helper should render helper", function() {
  var template = CompilerContext.compile("{{hello}}", {knownHelpers: {"hello" : true}});

  var result = template({}, {helpers: {hello: function() { return "foo"; }}});
  equal(result, "foo", "'foo' should === '" + result);
});

test("Unknown helper in knownHelpers only mode should be passed as undefined", function() {
  var template = CompilerContext.compile("{{typeof hello}}", {knownHelpers: {'typeof': true}, knownHelpersOnly: true});

  var result = template({}, {helpers: {'typeof': function(arg) { return typeof arg; }, hello: function() { return "foo"; }}});
  equal(result, "undefined", "'undefined' should === '" + result);
});
test("Builtin helpers available in knownHelpers only mode", function() {
  var template = CompilerContext.compile("{{#unless foo}}bar{{/unless}}", {knownHelpersOnly: true});

  var result = template({});
  equal(result, "bar", "'bar' should === '" + result);
});
test("Field lookup works in knownHelpers only mode", function() {
  var template = CompilerContext.compile("{{foo}}", {knownHelpersOnly: true});

  var result = template({foo: 'bar'});
  equal(result, "bar", "'bar' should === '" + result);
});
test("Conditional blocks work in knownHelpers only mode", function() {
  var template = CompilerContext.compile("{{#foo}}bar{{/foo}}", {knownHelpersOnly: true});

  var result = template({foo: 'baz'});
  equal(result, "bar", "'bar' should === '" + result);
});
test("Invert blocks work in knownHelpers only mode", function() {
  var template = CompilerContext.compile("{{^foo}}bar{{/foo}}", {knownHelpersOnly: true});

  var result = template({foo: false});
  equal(result, "bar", "'bar' should === '" + result);
});
test("Functions are bound to the context in knownHelpers only mode", function() {
  var template = CompilerContext.compile("{{foo}}", {knownHelpersOnly: true});
  var result = template({foo: function() { return this.bar; }, bar: 'bar'});
  equal(result, "bar", "'bar' should === '" + result);
});
test("Unknown helper call in knownHelpers only mode should throw", function() {
  shouldThrow(function() {
    CompilerContext.compile("{{typeof hello}}", {knownHelpersOnly: true});
  }, Error, 'specified knownHelpersOnly');
});

suite("blockHelperMissing");

test("lambdas are resolved by blockHelperMissing, not handlebars proper", function() {
  var string = "{{#truthy}}yep{{/truthy}}";
  var data = { truthy: function() { return true; } };
  shouldCompileTo(string, data, "yep");
});
test("lambdas resolved by blockHelperMissing are bound to the context", function() {
  var string = "{{#truthy}}yep{{/truthy}}";
  var boundData = { truthy: function() { return this.truthiness(); }, truthiness: function() { return false; } };
  shouldCompileTo(string, boundData, "");
});

var teardown;
suite("built-in helpers", {
  setup: function(){ teardown = null; },
  teardown: function(){ if (teardown) { teardown(); } }
});

test("with", function() {
  var string = "{{#with person}}{{first}} {{last}}{{/with}}";
  shouldCompileTo(string, {person: {first: "Alan", last: "Johnson"}}, "Alan Johnson");
});
test("with with function argument", function() {
  var string = "{{#with person}}{{first}} {{last}}{{/with}}";
  shouldCompileTo(string, {person: function() { return {first: "Alan", last: "Johnson"};}}, "Alan Johnson");
});

test("if", function() {
  var string   = "{{#if goodbye}}GOODBYE {{/if}}cruel {{world}}!";
  shouldCompileTo(string, {goodbye: true, world: "world"}, "GOODBYE cruel world!",
                  "if with boolean argument shows the contents when true");
  shouldCompileTo(string, {goodbye: "dummy", world: "world"}, "GOODBYE cruel world!",
                  "if with string argument shows the contents");
  shouldCompileTo(string, {goodbye: false, world: "world"}, "cruel world!",
                  "if with boolean argument does not show the contents when false");
  shouldCompileTo(string, {world: "world"}, "cruel world!",
                  "if with undefined does not show the contents");
  shouldCompileTo(string, {goodbye: ['foo'], world: "world"}, "GOODBYE cruel world!",
                  "if with non-empty array shows the contents");
  shouldCompileTo(string, {goodbye: [], world: "world"}, "cruel world!",
                  "if with empty array does not show the contents");
});

test("if with function argument", function() {
  var string   = "{{#if goodbye}}GOODBYE {{/if}}cruel {{world}}!";
  shouldCompileTo(string, {goodbye: function() {return true;}, world: "world"}, "GOODBYE cruel world!",
                  "if with function shows the contents when function returns true");
  shouldCompileTo(string, {goodbye: function() {return this.world;}, world: "world"}, "GOODBYE cruel world!",
                  "if with function shows the contents when function returns string");
  shouldCompileTo(string, {goodbye: function() {return false;}, world: "world"}, "cruel world!",
                  "if with function does not show the contents when returns false");
  shouldCompileTo(string, {goodbye: function() {return this.foo;}, world: "world"}, "cruel world!",
                  "if with function does not show the contents when returns undefined");
});

test("each", function() {
  var string   = "{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!";
  var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
  shouldCompileTo(string, hash, "goodbye! Goodbye! GOODBYE! cruel world!",
                  "each with array argument iterates over the contents when not empty");
  shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                  "each with array argument ignores the contents when empty");
});

test("each with an object and @key", function() {
  var string   = "{{#each goodbyes}}{{@key}}. {{text}}! {{/each}}cruel {{world}}!";
  var hash     = {goodbyes: {"<b>#1</b>": {text: "goodbye"}, 2: {text: "GOODBYE"}}, world: "world"};

  // Object property iteration order is undefined according to ECMA spec,
  // so we need to check both possible orders
  // @see http://stackoverflow.com/questions/280713/elements-order-in-a-for-in-loop
  var actual = compileWithPartials(string, hash);
  var expected1 = "&lt;b&gt;#1&lt;/b&gt;. goodbye! 2. GOODBYE! cruel world!";
  var expected2 = "2. GOODBYE! &lt;b&gt;#1&lt;/b&gt;. goodbye! cruel world!";

  ok(actual === expected1 || actual === expected2, "each with object argument iterates over the contents when not empty");
  shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                  "each with object argument ignores the contents when empty");
});

test("each with @index", function() {
  var string = "{{#each goodbyes}}{{@index}}. {{text}}! {{/each}}cruel {{world}}!";
  var hash   = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};

  var template = CompilerContext.compile(string);
  var result = template(hash);

  equal(result, "0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!", "The @index variable is used");
});

test("each with function argument", function() {
  var string = "{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!";
  var hash   = {goodbyes: function () { return [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}];}, world: "world"};
  shouldCompileTo(string, hash, "goodbye! Goodbye! GOODBYE! cruel world!",
            "each with array function argument iterates over the contents when not empty");
  shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
            "each with array function argument ignores the contents when empty");
});

test("data passed to helpers", function() {
  var string = "{{#each letters}}{{this}}{{detectDataInsideEach}}{{/each}}";
  var hash = {letters: ['a', 'b', 'c']};

  var template = CompilerContext.compile(string);
  var result = template(hash, {
    data: {
      exclaim: '!'
    }
  });
  equal(result, 'a!b!c!', 'should output data');
});

Handlebars.registerHelper('detectDataInsideEach', function(options) {
  return options.data && options.data.exclaim;
});

test("log", function() {
  var string = "{{log blah}}";
  var hash   = { blah: "whee" };

  var levelArg, logArg;
  var originalLog = Handlebars.log;
  Handlebars.log = function(level, arg){ levelArg = level, logArg = arg; };
  teardown = function(){ Handlebars.log = originalLog; };

  shouldCompileTo(string, hash, "", "log should not display");
  equals(1, levelArg, "should call log with 1");
  equals("whee", logArg, "should call log with 'whee'");
});

test("overriding property lookup", function() {

});


test("passing in data to a compiled function that expects data - works with helpers", function() {
  var template = CompilerContext.compile("{{hello}}", {data: true});

  var helpers = {
    hello: function(options) {
      return options.data.adjective + " "  + this.noun;
    }
  };

  var result = template({noun: "cat"}, {helpers: helpers, data: {adjective: "happy"}});
  equals("happy cat", result, "Data output by helper");
});

test("data can be looked up via @foo", function() {
  var template = CompilerContext.compile("{{@hello}}");
  var result = template({}, { data: { hello: "hello" } });
  equals("hello", result, "@foo retrieves template data");
});

var objectCreate = Handlebars.createFrame;

test("deep @foo triggers automatic top-level data", function() {
  var template = CompilerContext.compile('{{#let world="world"}}{{#if foo}}{{#if foo}}Hello {{@world}}{{/if}}{{/if}}{{/let}}');

  var helpers = objectCreate(Handlebars.helpers);

  helpers.let = function(options) {
    var frame = Handlebars.createFrame(options.data);

    for (var prop in options.hash) {
      frame[prop] = options.hash[prop];
    }
    return options.fn(this, { data: frame });
  };

  var result = template({ foo: true }, { helpers: helpers });
  equals("Hello world", result, "Automatic data was triggered");
});

test("parameter data can be looked up via @foo", function() {
  var template = CompilerContext.compile("{{hello @world}}");
  var helpers = {
    hello: function(noun) {
      return "Hello " + noun;
    }
  };

  var result = template({}, { helpers: helpers, data: { world: "world" } });
  equals("Hello world", result, "@foo as a parameter retrieves template data");
});

test("hash values can be looked up via @foo", function() {
  var template = CompilerContext.compile("{{hello noun=@world}}");
  var helpers = {
    hello: function(options) {
      return "Hello " + options.hash.noun;
    }
  };

  var result = template({}, { helpers: helpers, data: { world: "world" } });
  equals("Hello world", result, "@foo as a parameter retrieves template data");
});

test("nested parameter data can be looked up via @foo.bar", function() {
  var template = CompilerContext.compile("{{hello @world.bar}}");
  var helpers = {
    hello: function(noun) {
      return "Hello " + noun;
    }
  };

  var result = template({}, { helpers: helpers, data: { world: {bar: "world" } } });
  equals("Hello world", result, "@foo as a parameter retrieves template data");
});

test("nested parameter data does not fail with @world.bar", function() {
  var template = CompilerContext.compile("{{hello @world.bar}}");
  var helpers = {
    hello: function(noun) {
      return "Hello " + noun;
    }
  };

  var result = template({}, { helpers: helpers, data: { foo: {bar: "world" } } });
  equals("Hello undefined", result, "@foo as a parameter retrieves template data");
});

test("parameter data throws when using this scope references", function() {
  var string = "{{#goodbyes}}{{text}} cruel {{@./name}}! {{/goodbyes}}";

  shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error, "Should throw exception");
});

test("parameter data throws when using parent scope references", function() {
  var string = "{{#goodbyes}}{{text}} cruel {{@../name}}! {{/goodbyes}}";

  shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error, "Should throw exception");
});

test("parameter data throws when using complex scope references", function() {
  var string = "{{#goodbyes}}{{text}} cruel {{@foo/../name}}! {{/goodbyes}}";

  shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error, "Should throw exception");
});

test("data is inherited downstream", function() {
  var template = CompilerContext.compile("{{#let foo=bar.baz}}{{@foo}}{{/let}}", { data: true });
  var helpers = {
    let: function(options) {
      for (var prop in options.hash) {
        options.data[prop] = options.hash[prop];
      }
      return options.fn(this);
    }
  };

  var result = template({ bar: { baz: "hello world" } }, { helpers: helpers, data: {} });
  equals("hello world", result, "data variables are inherited downstream");
});

test("passing in data to a compiled function that expects data - works with helpers in partials", function() {
  var template = CompilerContext.compile("{{>my_partial}}", {data: true});

  var partials = {
    my_partial: CompilerContext.compile("{{hello}}", {data: true})
  };

  var helpers = {
    hello: function(options) {
      return options.data.adjective + " "  + this.noun;
    }
  };

  var result = template({noun: "cat"}, {helpers: helpers, partials: partials, data: {adjective: "happy"}});
  equals("happy cat", result, "Data output by helper inside partial");
});

test("passing in data to a compiled function that expects data - works with helpers and parameters", function() {
  var template = CompilerContext.compile("{{hello world}}", {data: true});

  var helpers = {
    hello: function(noun, options) {
      return options.data.adjective + " "  + noun + (this.exclaim ? "!" : "");
    }
  };

  var result = template({exclaim: true, world: "world"}, {helpers: helpers, data: {adjective: "happy"}});
  equals("happy world!", result, "Data output by helper");
});

test("passing in data to a compiled function that expects data - works with block helpers", function() {
  var template = CompilerContext.compile("{{#hello}}{{world}}{{/hello}}", {data: true});

  var helpers = {
    hello: function(options) {
      return options.fn(this);
    },
    world: function(options) {
      return options.data.adjective + " world" + (this.exclaim ? "!" : "");
    }
  };

  var result = template({exclaim: true}, {helpers: helpers, data: {adjective: "happy"}});
  equals("happy world!", result, "Data output by helper");
});

test("passing in data to a compiled function that expects data - works with block helpers that use ..", function() {
  var template = CompilerContext.compile("{{#hello}}{{world ../zomg}}{{/hello}}", {data: true});

  var helpers = {
    hello: function(options) {
      return options.fn({exclaim: "?"});
    },
    world: function(thing, options) {
      return options.data.adjective + " " + thing + (this.exclaim || "");
    }
  };

  var result = template({exclaim: true, zomg: "world"}, {helpers: helpers, data: {adjective: "happy"}});
  equals("happy world?", result, "Data output by helper");
});

test("passing in data to a compiled function that expects data - data is passed to with block helpers where children use ..", function() {
  var template = CompilerContext.compile("{{#hello}}{{world ../zomg}}{{/hello}}", {data: true});

  var helpers = {
    hello: function(options) {
      return options.data.accessData + " " + options.fn({exclaim: "?"});
    },
    world: function(thing, options) {
      return options.data.adjective + " " + thing + (this.exclaim || "");
    }
  };

  var result = template({exclaim: true, zomg: "world"}, {helpers: helpers, data: {adjective: "happy", accessData: "#win"}});
  equals("#win happy world?", result, "Data output by helper");
});

test("you can override inherited data when invoking a helper", function() {
  var template = CompilerContext.compile("{{#hello}}{{world zomg}}{{/hello}}", {data: true});

  var helpers = {
    hello: function(options) {
      return options.fn({exclaim: "?", zomg: "world"}, { data: {adjective: "sad"} });
    },
    world: function(thing, options) {
      return options.data.adjective + " " + thing + (this.exclaim || "");
    }
  };

  var result = template({exclaim: true, zomg: "planet"}, {helpers: helpers, data: {adjective: "happy"}});
  equals("sad world?", result, "Overriden data output by helper");
});


test("you can override inherited data when invoking a helper with depth", function() {
  var template = CompilerContext.compile("{{#hello}}{{world ../zomg}}{{/hello}}", {data: true});

  var helpers = {
    hello: function(options) {
      return options.fn({exclaim: "?"}, { data: {adjective: "sad"} });
    },
    world: function(thing, options) {
      return options.data.adjective + " " + thing + (this.exclaim || "");
    }
  };

  var result = template({exclaim: true, zomg: "world"}, {helpers: helpers, data: {adjective: "happy"}});
  equals("sad world?", result, "Overriden data output by helper");
});

test("helpers take precedence over same-named context properties", function() {
  var template = CompilerContext.compile("{{goodbye}} {{cruel world}}");

  var helpers = {
    goodbye: function() {
      return this.goodbye.toUpperCase();
    },

    cruel: function(world) {
      return "cruel " + world.toUpperCase();
    }
  };

  var context = {
    goodbye: "goodbye",
    world: "world"
  };

  var result = template(context, {helpers: helpers});
  equals(result, "GOODBYE cruel WORLD", "Helper executed");
});

test("helpers take precedence over same-named context properties$", function() {
  var template = CompilerContext.compile("{{#goodbye}} {{cruel world}}{{/goodbye}}");

  var helpers = {
    goodbye: function(options) {
      return this.goodbye.toUpperCase() + options.fn(this);
    },

    cruel: function(world) {
      return "cruel " + world.toUpperCase();
    }
  };

  var context = {
    goodbye: "goodbye",
    world: "world"
  };

  var result = template(context, {helpers: helpers});
  equals(result, "GOODBYE cruel WORLD", "Helper executed");
});

test("Scoped names take precedence over helpers", function() {
  var template = CompilerContext.compile("{{this.goodbye}} {{cruel world}} {{cruel this.goodbye}}");

  var helpers = {
    goodbye: function() {
      return this.goodbye.toUpperCase();
    },

    cruel: function(world) {
      return "cruel " + world.toUpperCase();
    },
  };

  var context = {
    goodbye: "goodbye",
    world: "world"
  };

  var result = template(context, {helpers: helpers});
  equals(result, "goodbye cruel WORLD cruel GOODBYE", "Helper not executed");
});

test("Scoped names take precedence over block helpers", function() {
  var template = CompilerContext.compile("{{#goodbye}} {{cruel world}}{{/goodbye}} {{this.goodbye}}");

  var helpers = {
    goodbye: function(options) {
      return this.goodbye.toUpperCase() + options.fn(this);
    },

    cruel: function(world) {
      return "cruel " + world.toUpperCase();
    },
  };

  var context = {
    goodbye: "goodbye",
    world: "world"
  };

  var result = template(context, {helpers: helpers});
  equals(result, "GOODBYE cruel WORLD goodbye", "Helper executed");
});

test("helpers can take an optional hash", function() {
  var template = CompilerContext.compile('{{goodbye cruel="CRUEL" world="WORLD" times=12}}');

  var helpers = {
    goodbye: function(options) {
      return "GOODBYE " + options.hash.cruel + " " + options.hash.world + " " + options.hash.times + " TIMES";
    }
  };

  var context = {};

  var result = template(context, {helpers: helpers});
  equals(result, "GOODBYE CRUEL WORLD 12 TIMES", "Helper output hash");
});

test("helpers can take an optional hash with booleans", function() {
  var helpers = {
    goodbye: function(options) {
      if (options.hash.print === true) {
        return "GOODBYE " + options.hash.cruel + " " + options.hash.world;
      } else if (options.hash.print === false) {
        return "NOT PRINTING";
      } else {
        return "THIS SHOULD NOT HAPPEN";
      }
    }
  };

  var context = {};

  var template = CompilerContext.compile('{{goodbye cruel="CRUEL" world="WORLD" print=true}}');
  var result = template(context, {helpers: helpers});
  equals(result, "GOODBYE CRUEL WORLD", "Helper output hash");

  template = CompilerContext.compile('{{goodbye cruel="CRUEL" world="WORLD" print=false}}');
  result = template(context, {helpers: helpers});
  equals(result, "NOT PRINTING", "Boolean helper parameter honored");
});

test("block helpers can take an optional hash", function() {
  var template = CompilerContext.compile('{{#goodbye cruel="CRUEL" times=12}}world{{/goodbye}}');

  var helpers = {
    goodbye: function(options) {
      return "GOODBYE " + options.hash.cruel + " " + options.fn(this) + " " + options.hash.times + " TIMES";
    }
  };

  var result = template({}, {helpers: helpers});
  equals(result, "GOODBYE CRUEL world 12 TIMES", "Hash parameters output");
});

test("block helpers can take an optional hash with single quoted stings", function() {
  var template = CompilerContext.compile("{{#goodbye cruel='CRUEL' times=12}}world{{/goodbye}}");

  var helpers = {
    goodbye: function(options) {
      return "GOODBYE " + options.hash.cruel + " " + options.fn(this) + " " + options.hash.times + " TIMES";
    }
  };

  var result = template({}, {helpers: helpers});
  equals(result, "GOODBYE CRUEL world 12 TIMES", "Hash parameters output");
});

test("block helpers can take an optional hash with booleans", function() {
  var helpers = {
    goodbye: function(options) {
      if (options.hash.print === true) {
        return "GOODBYE " + options.hash.cruel + " " + options.fn(this);
      } else if (options.hash.print === false) {
        return "NOT PRINTING";
      } else {
        return "THIS SHOULD NOT HAPPEN";
      }
    }
  };

  var template = CompilerContext.compile('{{#goodbye cruel="CRUEL" print=true}}world{{/goodbye}}');
  var result = template({}, {helpers: helpers});
  equals(result, "GOODBYE CRUEL world", "Boolean hash parameter honored");

  template = CompilerContext.compile('{{#goodbye cruel="CRUEL" print=false}}world{{/goodbye}}');
  result = template({}, {helpers: helpers});
  equals(result, "NOT PRINTING", "Boolean hash parameter honored");
});


test("arguments to helpers can be retrieved from options hash in string form", function() {
  var template = CompilerContext.compile('{{wycats is.a slave.driver}}', {stringParams: true});

  var helpers = {
    wycats: function(passiveVoice, noun) {
      return "HELP ME MY BOSS " + passiveVoice + ' ' + noun;
    }
  };

  var result = template({}, {helpers: helpers});

  equals(result, "HELP ME MY BOSS is.a slave.driver", "String parameters output");
});

test("when using block form, arguments to helpers can be retrieved from options hash in string form", function() {
  var template = CompilerContext.compile('{{#wycats is.a slave.driver}}help :({{/wycats}}', {stringParams: true});

  var helpers = {
    wycats: function(passiveVoice, noun, options) {
      return "HELP ME MY BOSS " + passiveVoice + ' ' +
              noun + ': ' + options.fn(this);
    }
  };

  var result = template({}, {helpers: helpers});

  equals(result, "HELP ME MY BOSS is.a slave.driver: help :(", "String parameters output");
});

test("when inside a block in String mode, .. passes the appropriate context in the options hash", function() {
  var template = CompilerContext.compile('{{#with dale}}{{tomdale ../need dad.joke}}{{/with}}', {stringParams: true});

  var helpers = {
    tomdale: function(desire, noun, options) {
      return "STOP ME FROM READING HACKER NEWS I " +
              options.contexts[0][desire] + " " + noun;
    },

    "with": function(context, options) {
      return options.fn(options.contexts[0][context]);
    }
  };

  var result = template({
    dale: {},

    need: 'need-a'
  }, {helpers: helpers});

  equals(result, "STOP ME FROM READING HACKER NEWS I need-a dad.joke", "Proper context variable output");
});

test("in string mode, information about the types is passed along", function() {
  var template = CompilerContext.compile('{{tomdale "need" dad.joke true false}}', { stringParams: true });

  var helpers = {
    tomdale: function(desire, noun, trueBool, falseBool, options) {
      equal(options.types[0], 'STRING', "the string type is passed");
      equal(options.types[1], 'ID', "the expression type is passed");
      equal(options.types[2], 'BOOLEAN', "the expression type is passed");
      equal(desire, "need", "the string form is passed for strings");
      equal(noun, "dad.joke", "the string form is passed for expressions");
      equal(trueBool, true, "raw booleans are passed through");
      equal(falseBool, false, "raw booleans are passed through");
      return "Helper called";
    }
  };

  var result = template({}, { helpers: helpers });
  equal(result, "Helper called");
});

test("in string mode, hash parameters get type information", function() {
  var template = CompilerContext.compile('{{tomdale he.says desire="need" noun=dad.joke bool=true}}', { stringParams: true });

  var helpers = {
    tomdale: function(exclamation, options) {
      equal(exclamation, "he.says");
      equal(options.types[0], "ID");

      equal(options.hashTypes.desire, "STRING");
      equal(options.hashTypes.noun, "ID");
      equal(options.hashTypes.bool, "BOOLEAN");
      equal(options.hash.desire, "need");
      equal(options.hash.noun, "dad.joke");
      equal(options.hash.bool, true);
      return "Helper called";
    }
  };

  var result = template({}, { helpers: helpers });
  equal(result, "Helper called");
});

test("in string mode, hash parameters get context information", function() {
  var template = CompilerContext.compile('{{#with dale}}{{tomdale he.says desire="need" noun=../dad/joke bool=true}}{{/with}}', { stringParams: true });

  var context = {dale: {}};

  var helpers = {
    tomdale: function(exclamation, options) {
      equal(exclamation, "he.says");
      equal(options.types[0], "ID");

      equal(options.contexts.length, 1);
      equal(options.hashContexts.noun, context);
      equal(options.hash.desire, "need");
      equal(options.hash.noun, "dad.joke");
      equal(options.hash.bool, true);
      return "Helper called";
    },
    "with": function(context, options) {
      return options.fn(options.contexts[0][context]);
    }
  };

  var result = template(context, { helpers: helpers });
  equal(result, "Helper called");
});

test("when inside a block in String mode, .. passes the appropriate context in the options hash to a block helper", function() {
  var template = CompilerContext.compile('{{#with dale}}{{#tomdale ../need dad.joke}}wot{{/tomdale}}{{/with}}', {stringParams: true});

  var helpers = {
    tomdale: function(desire, noun, options) {
      return "STOP ME FROM READING HACKER NEWS I " +
              options.contexts[0][desire] + " " + noun + " " +
              options.fn(this);
    },

    "with": function(context, options) {
      return options.fn(options.contexts[0][context]);
    }
  };

  var result = template({
    dale: {},

    need: 'need-a'
  }, {helpers: helpers});

  equals(result, "STOP ME FROM READING HACKER NEWS I need-a dad.joke wot", "Proper context variable output");
});

suite("Regressions");

test("GH-94: Cannot read property of undefined", function() {
	var data = {"books":[{"title":"The origin of species","author":{"name":"Charles Darwin"}},{"title":"Lazarillo de Tormes"}]};
	var string = "{{#books}}{{title}}{{author.name}}{{/books}}";
	shouldCompileTo(string, data, "The origin of speciesCharles DarwinLazarillo de Tormes",
                  "Renders without an undefined property error");
});

test("GH-150: Inverted sections print when they shouldn't", function() {
  var string = "{{^set}}not set{{/set}} :: {{#set}}set{{/set}}";

  shouldCompileTo(string, {}, "not set :: ", "inverted sections run when property isn't present in context");
  shouldCompileTo(string, {set: undefined}, "not set :: ", "inverted sections run when property is undefined");
  shouldCompileTo(string, {set: false}, "not set :: ", "inverted sections run when property is false");
  shouldCompileTo(string, {set: true}, " :: set", "inverted sections don't run when property is true");
});

test("Mustache man page", function() {
  var string = "Hello {{name}}. You have just won ${{value}}!{{#in_ca}} Well, ${{taxed_value}}, after taxes.{{/in_ca}}";
  var data = {
    "name": "Chris",
    "value": 10000,
    "taxed_value": 10000 - (10000 * 0.4),
    "in_ca": true
  };

  shouldCompileTo(string, data, "Hello Chris. You have just won $10000! Well, $6000, after taxes.", "the hello world mustache example works");
});

test("GH-158: Using array index twice, breaks the template", function() {
  var string = "{{arr.[0]}}, {{arr.[1]}}";
  var data = { "arr": [1,2] };

  shouldCompileTo(string, data, "1, 2", "it works as expected");
});

test("bug reported by @fat where lambdas weren't being properly resolved", function() {
  var string = "<strong>This is a slightly more complicated {{thing}}.</strong>.\n{{! Just ignore this business. }}\nCheck this out:\n{{#hasThings}}\n<ul>\n{{#things}}\n<li class={{className}}>{{word}}</li>\n{{/things}}</ul>.\n{{/hasThings}}\n{{^hasThings}}\n\n<small>Nothing to check out...</small>\n{{/hasThings}}";
  var data = {
    thing: function() {
      return "blah";
    },
    things: [
      {className: "one", word: "@fat"},
      {className: "two", word: "@dhg"},
      {className: "three", word:"@sayrer"}
    ],
    hasThings: function() {
      return true;
    }
  };

  var output = "<strong>This is a slightly more complicated blah.</strong>.\n\nCheck this out:\n\n<ul>\n\n<li class=one>@fat</li>\n\n<li class=two>@dhg</li>\n\n<li class=three>@sayrer</li>\n</ul>.\n\n";
  shouldCompileTo(string, data, output);
});

test("Passing falsy values to Handlebars.compile throws an error", function() {
  shouldThrow(function() {
    CompilerContext.compile(null);
  }, "You must pass a string or Handlebars AST to Handlebars.precompile. You passed null");
});

test("can pass through an already-compiled AST via compile/precompile", function() {
  equal(Handlebars.compile(new Handlebars.AST.ProgramNode([ new Handlebars.AST.ContentNode("Hello")]))(), 'Hello')
});

test('GH-408: Multiple loops fail', function() {
  var context = [
    { name: "John Doe", location: { city: "Chicago" } },
    { name: "Jane Doe", location: { city: "New York"} }
  ];

  var template = CompilerContext.compile('{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}');

  var result = template(context);
  equals(result, "John DoeJane DoeJohn DoeJane DoeJohn DoeJane Doe", 'It should output multiple times');
});

test('GS-428: Nested if else rendering', function() {
  var succeedingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}}  {{#blk}} Expected {{/blk}} {{/inverse}}';
  var failingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}} {{#blk}} Expected {{/blk}} {{/inverse}}';

  var helpers = {
    blk: function(block) { return block.fn(''); },
    inverse: function(block) { return block.inverse(''); }
  };

  shouldCompileTo(succeedingTemplate, [{}, helpers], '   Expected  ');
  shouldCompileTo(failingTemplate, [{}, helpers], '  Expected  ');
});

test('GH-458: Scoped this identifier', function() {
  shouldCompileTo('{{./foo}}', {foo: 'bar'}, 'bar');
});

test('GH-375: Unicode line terminators', function() {
  shouldCompileTo('\u2028', {}, '\u2028');
});

test('GH-534: Object prototype aliases', function() {
  Object.prototype[0xD834] = true;

  shouldCompileTo('{{foo}}', { foo: 'bar' }, 'bar');

  delete Object.prototype[0xD834];
});

test('GH-437: Matching escaping', function() {
  shouldThrow(function() {
    CompilerContext.compile('{{{a}}');
  }, Error);
  shouldThrow(function() {
    CompilerContext.compile('{{a}}}');
  }, Error);
});

suite('Utils');

test('escapeExpression', function() {
  equal(Handlebars.Utils.escapeExpression('foo<&"\'>'), 'foo&lt;&amp;&quot;&#x27;&gt;');
  equal(Handlebars.Utils.escapeExpression(new Handlebars.SafeString('foo<&"\'>')), 'foo<&"\'>');
  equal(Handlebars.Utils.escapeExpression(''), '');
  equal(Handlebars.Utils.escapeExpression(undefined), '');
  equal(Handlebars.Utils.escapeExpression(null), '');
  equal(Handlebars.Utils.escapeExpression(false), '');

  equal(Handlebars.Utils.escapeExpression(0), '0');
  equal(Handlebars.Utils.escapeExpression({}), {}.toString());
  equal(Handlebars.Utils.escapeExpression([]), [].toString());
});

test('isEmpty', function() {
  equal(Handlebars.Utils.isEmpty(undefined), true);
  equal(Handlebars.Utils.isEmpty(null), true);
  equal(Handlebars.Utils.isEmpty(false), true);
  equal(Handlebars.Utils.isEmpty(''), true);
  equal(Handlebars.Utils.isEmpty([]), true);

  equal(Handlebars.Utils.isEmpty(0), false);
  equal(Handlebars.Utils.isEmpty([1]), false);
  equal(Handlebars.Utils.isEmpty('foo'), false);
  equal(Handlebars.Utils.isEmpty({bar: 1}), false);
});

if (typeof(require) !== 'undefined') {
  suite('Require');

  test('Load .handlebars files with require()', function() {
    var template = require("./example_1");
    assert.deepEqual(template, require("./example_1.handlebars"));

    var expected = 'foo\n';
    var result = template({foo: "foo"});

    equal(result, expected);
  });

  test('Load .hbs files with require()', function() {
    var template = require("./example_2");
    assert.deepEqual(template, require("./example_2.hbs"));

    var expected = 'Hello, World!\n';
    var result = template({name: "World"});

    equal(result, expected);
  });
}
