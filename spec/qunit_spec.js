module("basic context");

Handlebars.registerHelper('helperMissing', function(helper, context) {
  if(helper === "link_to") {
    return new Handlebars.SafeString("<a>" + context + "</a>");
  }
});

var shouldCompileTo = function(string, hash, expected, message) {
  var template = Handlebars.compile(string);
  if(Object.prototype.toString.call(hash) === "[object Array]") {
    if(hash[1]) {
      for(var prop in Handlebars.helpers) {
        hash[1][prop] = Handlebars.helpers[prop];
      }
    }
  } else {
    hash = [hash];
  }

  result = template.apply(this, hash)
  equal(result, expected, "'" + expected + "' should === '" + result + "': " + message);
};

var shouldThrow = function(fn, exception, message) {
  var caught = false;
  try {
    fn();
  }
  catch (e) {
    if (e instanceof exception) {
      caught = true;
    }
  }

  ok(caught, message || null);
}


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
  shouldCompileTo("Awesome\\ foo", {}, "Awesome\\ foo", "text is escaped so that it doesn't mess up backslashes");
  shouldCompileTo(' " " ', {}, ' " " ', "double quotes never produce invalid javascript");
});

test("escaping expressions", function() {
 shouldCompileTo("{{{awesome}}}", {awesome: "&\"\\<>"}, '&\"\\<>',
        "expressions with 3 handlebars aren't escaped");

 shouldCompileTo("{{awesome}}", {awesome: "&\"\\<>"}, '&amp;\"\\&lt;&gt;',
        "by default expressions should be escaped");

 shouldCompileTo("{{&awesome}}", {awesome: "&\"\\<>"}, '&\"\\<>',
        "expressions with {{& handlebars aren't escaped");

});

test("functions returning safestrings shouldn't be escaped", function() {
  var hash = {awesome: function() { return new Handlebars.SafeString("&\"\\<>"); }};
  shouldCompileTo("{{awesome}}", hash, '&\"\\<>',
      "functions returning safestrings aren't escaped");
});

test("functions", function() {
  shouldCompileTo("{{awesome}}", {awesome: function() { return "Awesome"; }}, "Awesome",
                  "functions are called and render their output");
});

test("functions with context argument", function() {
  shouldCompileTo("{{awesome frank}}",
      {awesome: function(context) { return context; },
        frank: "Frank"},
      "Frank", "functions are called with context arguments");
});

test("nested paths", function() {
  shouldCompileTo("Goodbye {{alan/expression}} world!", {alan: {expression: "beautiful"}},
                  "Goodbye beautiful world!", "Nested paths access nested objects");
});

test("nested paths with empty string value", function() {
  shouldCompileTo("Goodbye {{alan/expression}} world!", {alan: {expression: ""}},
                  "Goodbye  world!", "Nested paths access nested objects with empty string");
});

test("--- TODO --- bad idea nested paths", function() {
  return;
	var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
  shouldThrow(function() {
      Handlebars.compile("{{#goodbyes}}{{../name/../name}}{{/goodbyes}}")(hash);
    }, Handlebars.Exception,
    "Cannot jump (..) into previous context after moving into a context.");

  var string = "{{#goodbyes}}{{.././world}} {{/goodbyes}}";
  shouldCompileTo(string, hash, "world world world ", "Same context (.) is ignored in paths");
});

test("that current context path ({{.}}) doesn't hit fallback", function() {
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

  string = "{{#hellos}}{{this/text}}{{/hellos}}"
  hash = {hellos: [{text: "hello"}, {text: "Hello"}, {text: "HELLO"}]};
  shouldCompileTo(string, hash, "helloHelloHELLO", "This keyword evaluates in more complex paths");
});

module("inverted sections");

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

test("inverted section using result of function call", function() {
  var string = "{{goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}";
  var hash = {goodbyes: function() { return false; }}
  shouldCompileTo(string, hash, "Right On!", "Inverted section rendered when result of function in expression is false.");
});

module("blocks");

test("array", function() {
  var string   = "{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!"
  var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
  shouldCompileTo(string, hash, "goodbye! Goodbye! GOODBYE! cruel world!",
                  "Arrays iterate over the contents when not empty");

  shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                  "Arrays ignore the contents when empty");

});

test("empty block", function() {
  var string   = "{{#goodbyes}}{{/goodbyes}}cruel {{world}}!"
  var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
  shouldCompileTo(string, hash, "cruel world!",
                  "Arrays iterate over the contents when not empty");

  shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                  "Arrays ignore the contents when empty");
});

test("incorrectly matched blocks", function() {
  var string = "{{#goodbyes}}{{/hellos}}";

  shouldThrow(function() {
      Handlebars.compile(string);
    }, Handlebars.Exception, "Incorrectly matched blocks return an exception at compile time.");
});

test("nested iteration", function() {

});

test("block with complex lookup", function() {
  var string = "{{#goodbyes}}{{text}} cruel {{../name}}! {{/goodbyes}}"
  var hash     = {name: "Alan", goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}]};

  shouldCompileTo(string, hash, "goodbye cruel Alan! Goodbye cruel Alan! GOODBYE cruel Alan! ",
                  "Templates can access variables in contexts up the stack with relative path syntax");
});

test("helper with complex lookup", function() {
  var string = "{{#goodbyes}}{{{link ../prefix}}}{{/goodbyes}}"
  var hash = {prefix: "/root", goodbyes: [{text: "Goodbye", url: "goodbye"}]};
  var fallback = {link: function(prefix) {
    return "<a href='" + prefix + "/" + this.url + "'>" + this.text + "</a>"
  }};
  shouldCompileTo(string, [hash, fallback], "<a href='/root/goodbye'>Goodbye</a>")
});

test("helper block with complex lookup expression", function() {
  var string = "{{#goodbyes}}{{../name}}{{/goodbyes}}"
  var hash = {name: "Alan"};
  var fallback = {goodbyes: function(fn) {
		var out = "";
		var byes = ["Goodbye", "goodbye", "GOODBYE"];
		for (var i = 0,j = byes.length; i < j; i++) {
			out += byes[i] + " " + fn(this) + "! ";
		}
    return out;
  }};
  shouldCompileTo(string, [hash, fallback], "Goodbye Alan! goodbye Alan! GOODBYE Alan! ");
});

test("helper with complex lookup and nested template", function() {
  var string = "{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}";
  var hash = {prefix: '/root', goodbyes: [{text: "Goodbye", url: "goodbye"}]};
  var fallback = {link: function (prefix, fn) {
      return "<a href='" + prefix + "/" + this.url + "'>" + fn(this) + "</a>";
  }};
  shouldCompileTo(string, [hash, fallback], "<a href='/root/goodbye'>Goodbye</a>")
});

test("block with deep nested complex lookup", function() {
  var string = "{{#outer}}Goodbye {{#inner}}cruel {{../../omg}}{{/inner}}{{/outer}}";
  var hash = {omg: "OMG!", outer: [{ inner: [{ text: "goodbye" }] }] };

  shouldCompileTo(string, hash, "Goodbye cruel OMG!");
});

test("block helper", function() {
  var string   = "{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!";
  var template = Handlebars.compile(string);

  result = template({goodbyes: function(fn) { return fn({text: "GOODBYE"}); }, world: "world"});
  equal(result, "GOODBYE! cruel world!", "Testing a block helper");
});

test("block helper staying in the same context", function() {
  var string   = "{{#form}}<p>{{name}}</p>{{/form}}"
  var template = Handlebars.compile(string);

  result = template({form: function(fn) { return "<form>" + fn(this) + "</form>" }, name: "Yehuda"});
  equal(result, "<form><p>Yehuda</p></form>", "Testing block helper staying in the same context");
});

test("block helper should have context in this", function() {
  var source = "<ul>{{#people}}<li>{{#link}}{{name}}{{/link}}</li>{{/people}}</ul>";
  var link = function(fn) {
    return '<a href="/people/' + this.id + '">' + fn(this) + '</a>';
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
  var string   = "{{#form yehuda}}<p>{{name}}</p>{{/form}}"
  var template = Handlebars.compile(string);

  result = template({form: function(context, fn) { return "<form>" + fn(context) + "</form>" }, yehuda: {name: "Yehuda"}});
  equal(result, "<form><p>Yehuda</p></form>", "Testing block helper passing a new context");
});

test("block helper passing a complex path context", function() {
  var string   = "{{#form yehuda/cat}}<p>{{name}}</p>{{/form}}"
  var template = Handlebars.compile(string);

  result = template({form: function(context, fn) { return "<form>" + fn(context) + "</form>" }, yehuda: {name: "Yehuda", cat: {name: "Harold"}}});
  equal(result, "<form><p>Harold</p></form>", "Testing block helper passing a complex path context");
});

test("nested block helpers", function() {
  var string   = "{{#form yehuda}}<p>{{name}}</p>{{#link}}Hello{{/link}}{{/form}}"
  var template = Handlebars.compile(string);

  result = template({
    form: function(context, fn) { return "<form>" + fn(context) + "</form>" },
    yehuda: {name: "Yehuda",
             link: function(fn) { return "<a href='" + this.name + "'>" + fn(this) + "</a>"; }
            }
  });
  equal(result, "<form><p>Yehuda</p><a href='Yehuda'>Hello</a></form>", "Testing nested block helpers");
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
  var string = "{{#list people}}{{name}}{{^}}<em>Nobody's here</em>{{/list}}"
  var list = function(context, fn, inverse) {
    if (context.length > 0) {
      var out = "<ul>";
      for(var i = 0,j=context.length; i < j; i++) {
        out += "<li>";
        out += fn(context[i]);
        out += "</li>";
      }
      out += "</ul>";
      return out;
    } else {
      return "<p>" + inverse(this) + "</p>";
    }
  };

  var hash = {list: list, people: [{name: "Alan"}, {name: "Yehuda"}]};
  var empty = {list: list, people: []};
  var rootMessage = {
    list: function(context, fn, inverse) { if(context.length === 0) { return "<p>" + inverse(this) + "</p>"; } },
    people: [],
    message: "Nobody's here"
  }

  var messageString = "{{#list people}}Hello{{^}}{{message}}{{/list}}";

  // the meaning here may be kind of hard to catch, but list.not is always called,
  // so we should see the output of both
  shouldCompileTo(string, hash, "<ul><li>Alan</li><li>Yehuda</li></ul>", "an inverse wrapper is passed in as a new context");
  shouldCompileTo(string, empty, "<p><em>Nobody's here</em></p>", "an inverse wrapper can be optionally called");
  shouldCompileTo(messageString, rootMessage, "<p>Nobody's here</p>", "the context of an inverse is the parent of the block");
});

module("fallback hash");

test("providing a fallback hash", function() {
  shouldCompileTo("Goodbye {{cruel}} {{world}}!", [{cruel: "cruel"}, {world: "world"}], "Goodbye cruel world!",
                  "Fallback hash is available");

  shouldCompileTo("Goodbye {{#iter}}{{cruel}} {{world}}{{/iter}}!", [{iter: [{cruel: "cruel"}]}, {world: "world"}],
                  "Goodbye cruel world!", "Fallback hash is available inside other blocks");
});

test("in cases of conflict, the explicit hash wins", function() {

});

test("the fallback hash is available is nested contexts", function() {

});

module("partials");

test("basic partials", function() {
  var string = "Dudes: {{#dudes}}{{> dude}}{{/dudes}}";
  var partial = "{{name}} ({{url}}) ";
  var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
  shouldCompileTo(string, [hash, {}, {dude: partial}], "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                  "Basic partials output based on current context.");
});

test("partials with context", function() {
  var string = "Dudes: {{>dude dudes}}";
  var partial = "{{#this}}{{name}} ({{url}}) {{/this}}";
  var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
  shouldCompileTo(string, [hash, {}, {dude: partial}], "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                  "Partials can be passed a context");
});

test("partial in a partial", function() {
  var string = "Dudes: {{#dudes}}{{>dude}}{{/dudes}}";
  var dude = "{{name}} {{> url}} ";
  var url = "<a href='{{url}}'>{{url}}</a>";
  var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
  shouldCompileTo(string, [hash, {}, {dude: dude, url: url}], "Dudes: Yehuda <a href='http://yehuda'>http://yehuda</a> Alan <a href='http://alan'>http://alan</a> ", "Partials are rendered inside of other partials");
});

test("rendering undefined partial throws an exception", function() {
  shouldThrow(function() {
      var template = Handlebars.compile("{{> whatever}}");
      template();
    }, Handlebars.Exception, "Should throw exception");
});

test("GH-14: a partial preceding a selector", function() {
   var string = "Dudes: {{>dude}} {{another_dude}}";
   var dude = "{{name}}";
   var hash = {name:"Jeepers", another_dude:"Creepers"};
   shouldCompileTo(string, [hash, {}, {dude:dude}], "Dudes: Jeepers Creepers", "Regular selectors can follow a partial");
});

module("String literal parameters");

test("simple literals work", function() {
  var string   = 'Message: {{hello "world"}}';
  var hash     = {};
  var fallback = {hello: function(param) { return "Hello " + param; }}
  shouldCompileTo(string, [hash, fallback], "Message: Hello world", "template with a simple String literal");
});

test("using a quote in the middle of a parameter raises an error", function() {
  shouldThrow(function() {
    var string   = 'Message: {{hello wo"rld"}}';
    Handlebars.compile(string);
  }, Error, "should throw exception");
});

test("escaping a String is possible", function(){
  var string   = 'Message: {{hello "\\"world\\""}}';
  var hash     = {}
  var fallback = {hello: function(param) { return "Hello " + param; }}
  shouldCompileTo(string, [hash, fallback], "Message: Hello \"world\"", "template with an escaped String literal");
});

test("it works with ' marks", function() {
  var string   = 'Message: {{hello "Alan\'s world"}}';
  var hash     = {}
  var fallback = {hello: function(param) { return "Hello " + param; }}
  shouldCompileTo(string, [hash, fallback], "Message: Hello Alan's world", "template with a ' mark");
});

module("multiple parameters");

test("simple multi-params work", function() {
  var string   = 'Message: {{goodbye cruel world}}';
  var hash     = {cruel: "cruel", world: "world"}
  var fallback = {goodbye: function(cruel, world) { return "Goodbye " + cruel + " " + world; }}
  shouldCompileTo(string, [hash, fallback], "Message: Goodbye cruel world", "regular helpers with multiple params");
});

test("block multi-params work", function() {
  var string   = 'Message: {{#goodbye cruel world}}{{greeting}} {{adj}} {{noun}}{{/goodbye}}';
  var hash     = {cruel: "cruel", world: "world"}
  var fallback = {goodbye: function(cruel, world, fn) {
    return fn({greeting: "Goodbye", adj: cruel, noun: world});
  }}
  shouldCompileTo(string, [hash, fallback], "Message: Goodbye cruel world", "block helpers with multiple params");
})

module("safestring");

test("constructing a safestring from a string and checking its type", function() {
  var safe = new Handlebars.SafeString("testing 1, 2, 3");
  ok(safe instanceof Handlebars.SafeString, "SafeString is an instance of Handlebars.SafeString");
  equal(safe, "testing 1, 2, 3", "SafeString is equivalent to its underlying string");
});

module("helperMissing");

test("if a context is not found, helperMissing is used", function() {
  var string = "{{hello}} {{link_to world}}"
  var context = { hello: "Hello", world: "world" };

  shouldCompileTo(string, context, "Hello <a>world</a>")
});

module("built-in helpers");

test("with", function() {
  var string = "{{#with person}}{{first}} {{last}}{{/with}}";
  shouldCompileTo(string, {person: {first: "Alan", last: "Johnson"}}, "Alan Johnson");
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
});

test("each", function() {
  var string   = "{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!"
  var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
  shouldCompileTo(string, hash, "goodbye! Goodbye! GOODBYE! cruel world!",
                  "each with array argument iterates over the contents when not empty");
  shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                  "each with array argument ignores the contents when empty");
});

test("overriding property lookup", function() {

});


test("passing in data to a compiled function that expects data - works with helpers", function() {
  var template = Handlebars.compile("{{hello}}", true);

  var helpers = {
    hello: function(options) {
      return options.data.adjective + " "  + this.noun;
    }
  };

  var result = template({noun: "cat"}, helpers, null, {adjective: "happy"});
  equals("happy cat", result, "Testing passing in data to a compiled function that expects data - works with helpers");
});

test("passing in data to a compiled function that expects data - works with helpers and parameters", function() {
  var template = Handlebars.compile("{{hello world}}", true);

  var helpers = {
    hello: function(noun, options) {
      return options.data.adjective + " "  + noun + (this.exclaim ? "!" : "");
    }
  };

  var result = template({exclaim: true, world: "world"}, helpers, null, {adjective: "happy"});
  equals("happy world!", result, "Testing passing in data to a compiled function that expects data - works with helpers and parameters");
});

test("passing in data to a compiled function that expects data - works with block helpers", function() {
  var template = Handlebars.compile("{{#hello}}{{world}}{{/hello}}", true);

  var helpers = {
    hello: function(fn) {
      return fn(this);
    },
    world: function(options) {
      return options.data.adjective + " world" + (this.exclaim ? "!" : "");
    }
  };

  var result = template({exclaim: true}, helpers, null, {adjective: "happy"});
  equals("happy world!", result, "Testing passing in data to a compiled function that expects data - works with block helpers");
});

test("passing in data to a compiled function that expects data - works with block helpers that use ..", function() {
  var template = Handlebars.compile("{{#hello}}{{world ../zomg}}{{/hello}}", true);

  var helpers = {
    hello: function(fn) {
      return fn({exclaim: "?"});
    },
    world: function(thing, options) {
      return options.data.adjective + " " + thing + (this.exclaim || "");
    }
  };

  var result = template({exclaim: true, zomg: "world"}, helpers, null, {adjective: "happy"});
  equals("happy world?", result, "Testing passing in data to a compiled function that expects data - works with block helpers that use ..");
});

test("passing in data to a compiled function that expects data - works with block helpers that use ..", function() {
  var template = Handlebars.compile("{{#hello}}{{world ../zomg}}{{/hello}}", true);

  var helpers = {
    hello: function(fn, inverse, options) {
      return options.data.accessData + " " + fn({exclaim: "?"});
    },
    world: function(thing, options) {
      return options.data.adjective + " " + thing + (this.exclaim || "");
    }
  };

  var result = template({exclaim: true, zomg: "world"}, helpers, null, {adjective: "happy", accessData: "#win"});
  equals("#win happy world?", result, "Testing passing in data to a compiled function that expects data - works with block helpers that use ..");
});

test("you can override inherited data when invoking a helper", function() {
  var template = Handlebars.compile("{{#hello}}{{world zomg}}{{/hello}}", true);

  var helpers = {
    hello: function(fn) {
      return fn({exclaim: "?", zomg: "world"}, null, null, {adjective: "sad"});
    },
    world: function(thing, options) {
      return options.data.adjective + " " + thing + (this.exclaim || "");
    }
  };

  var result = template({exclaim: true, zomg: "planet"}, helpers, null, {adjective: "happy"});
  equals("sad world?", result, "Testing you can override inherited data when invoking a helper");
});


test("you can override inherited data when invoking a helper with depth", function() {
  var template = Handlebars.compile("{{#hello}}{{world ../zomg}}{{/hello}}", true);

  var helpers = {
    hello: function(fn) {
      return fn({exclaim: "?"}, null, null, {adjective: "sad"});
    },
    world: function(thing, options) {
      return options.data.adjective + " " + thing + (this.exclaim || "");
    }
  };

  var result = template({exclaim: true, zomg: "world"}, helpers, null, {adjective: "happy"});
  equals("sad world?", result, "Testing you can override inherited data when invoking a helper with depth");
});

test("helpers take precedence over same-named context properties", function() {
  var template = Handlebars.compile("{{goodbye}} {{cruel world}}");

  var helpers = {
    goodbye: function() {
      return this.goodbye.toUpperCase();
    }
  };

  var context = {
    cruel: function(world) {
      return "cruel " + world.toUpperCase();
    },

    goodbye: "goodbye",
    world: "world"
  };

  var result = template(context, helpers);
  equals(result, "GOODBYE cruel WORLD", "Testing helpers take precedence over same-named context properties");
});

test("helpers take precedence over same-named context properties", function() {
  var template = Handlebars.compile("{{#goodbye}} {{cruel world}}{{/goodbye}}");

  var helpers = {
    goodbye: function(fn) {
      return this.goodbye.toUpperCase() + fn(this);
    }
  };

  var context = {
    cruel: function(world) {
      return "cruel " + world.toUpperCase();
    },

    goodbye: "goodbye",
    world: "world"
  };

  var result = template(context, helpers);
  equals(result, "GOODBYE cruel WORLD", "Testing helpers take precedence over same-named context properties");
});

test("helpers can take an optional hash", function() {
  var template = Handlebars.compile('{{goodbye cruel="CRUEL" world="WORLD"}}');

  var helpers = {
    goodbye: function(options) {
      return "GOODBYE " + options.hash.cruel + " " + options.hash.world;
    }
  };

  var context = {};

  var result = template(context, helpers);
  equals(result, "GOODBYE CRUEL WORLD");
});

// test("helpers can take an optional hash", function() {
//   var template = Handlebars.compile('{{#goodbye cruel="CRUEL"}}world{{/goodbye}}')
// });
