module("basic context");

var shouldCompileTo = function(string, hash, result, message) {
  var template = Handlebars.compile(string);
  var params = toString.call(hash) === "[object Array]" ? hash : [hash, undefined];
  equal(template.apply(this, params), result, message);
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

test("escaping text", function() {
  shouldCompileTo("Awesome's", {}, "Awesome's", "text is escaped so that it doesn't get caught on single quotes");
  shouldCompileTo("Awesome\\", {}, "Awesome\\", "text is escaped so that the closing quote can't be ignored");
  shouldCompileTo(' " " ', {}, ' " " ', "double quotes never produce invalid javascript");
});

test("escaping expressions", function() {
 shouldCompileTo("{{{awesome}}}", {awesome: "&\"\\<>"}, '&\"\\<>',
        "expressions with 3 handlebars aren't escaped");

 shouldCompileTo("{{awesome}}", {awesome: "&\"\\<>"}, '&amp;\"\\\\&lt;&gt;',
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

test("bad idea nested paths", function() {
  var caught = false;
  try {
    Handlebars.compile("{{#goodbyes}}{{../name/../name}}{{/goodbyes}}"); 
  } catch (e) {
    if (e instanceof Handlebars.Exception) {
      caught = true;
    }
  }
  equals(caught, true, "Cannot jump (..) into previous context after moving into context.");

  var string = "{{#goodbyes}}{{.././world}} {{/goodbyes}}";
  var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
  shouldCompileTo(string, hash, "world world world ", "Same context (.) is ignored in paths");
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

test("nested iteration", function() {

});

test("block with complex lookup", function() {
  var string = "{{#goodbyes}}{{text}} cruel {{../name}}! {{/goodbyes}}"
  var hash     = {name: "Alan", goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}]};

  shouldCompileTo(string, hash, "goodbye cruel Alan! Goodbye cruel Alan! GOODBYE cruel Alan! ",
                  "Templates can access variables in contexts up the stack with relative path syntax");
});

test("helper with complex lookup", function() {
  var string = "{{#goodbyes}}{{{link}}}{{/goodbyes}}"
  var hash = {prefix: "/root", goodbyes: [{text: "Goodbye", url: "goodbye"}]};
  var fallback = {link: function() { 
    return "<a href='" + this.__get__("../prefix") + "/" + this.url + "'>" + this.text + "</a>" 
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

  result = template({goodbyes: function(context, fn) { return fn({text: "GOODBYE"}); }, world: "world"});
  equal(result, "GOODBYE! cruel world!");
});

test("block helper staying in the same context", function() {
  var string   = "{{#form}}<p>{{name}}</p>{{/form}}"
  var template = Handlebars.compile(string);

  result = template({form: function(context, fn) { return "<form>" + fn(this) + "</form>" }, name: "Yehuda"});
  equal(result, "<form><p>Yehuda</p></form>");
});

test("block helper passing a new context", function() {
  var string   = "{{#form yehuda}}<p>{{name}}</p>{{/form}}"
  var template = Handlebars.compile(string);

  result = template({form: function(context, fn) { return "<form>" + fn(context) + "</form>" }, yehuda: {name: "Yehuda"}});
  equal(result, "<form><p>Yehuda</p></form>");
});

test("block helper passing a complex path context", function() {
  var string   = "{{#form yehuda/cat}}<p>{{name}}</p>{{/form}}"
  var template = Handlebars.compile(string);

  result = template({form: function(context, fn) { return "<form>" + fn(context) + "</form>" }, yehuda: {name: "Yehuda", cat: {name: "Harold"}}});
  equal(result, "<form><p>Harold</p></form>");
});

test("nested block helpers", function() {
  var string   = "{{#form yehuda}}<p>{{name}}</p>{{#link}}Hello{{/link}}{{/form}}"
  var template = Handlebars.compile(string);

  result = template({form: function(context, fn) { return "<form>" + fn(context) + "</form>" }, yehuda: {name: "Yehuda", link: function(context, fn) { return "<a href='" + context.name + "'>" + fn(context) + "</a>"; }}});
  equal(result, "<form><p>Yehuda</p><a href='Yehuda'>Hello</a></form>");
});

test("block inverted sections", function() {
  var string = "{{#list people}}{{name}}{{^}}<em>Nobody's here</em>{{/list}}"
  var list = function(context, fn) { 
    if (context.length > 0) {
      var out = "<ul>";
      for(var i = 0,j=context.length; i < j; i++) {
        out += "<li>"; 
        out += fn(context[i]);
        out += "</li>";
      }
      out += "</ul>";
      return out;
    }
  };

  list.not = function(context, fn) {
    return "<p>" + fn(context, this) + "</p>"; 
  };
  var hash = {list: list, people: [{name: "Alan"}, {name: "Yehuda"}]};

  // the meaning here may be kind of hard to catch, but list.not is always called,
  // so we should see the output of both
  shouldCompileTo(string, hash, "<ul><li>Alan</li><li>Yehuda</li></ul><p><em>Nobody's here</em></p>", "Not is called when block inverted section is encountered.");
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
  shouldCompileTo(string, [hash, {partials: {dude: partial}}], "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                  "Basic partials output based on current context.");
});

test("partials with context", function() {
  var string = "Dudes: {{> dude dudes}}";
  var partial = "{{#this}}{{name}} ({{url}}) {{/this}}";
  var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
  shouldCompileTo(string, [hash, {partials: {dude: partial}}], "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                  "Partials can be passed a context");
});

test("partial in a partial", function() {
  var string = "Dudes: {{#dudes}}{{> dude}}{{/dudes}}";
  var dude = "{{name}} {{> url}} ";
  var url = "<a href='{{url}}'>{{url}}</a>";
  var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
  shouldCompileTo(string, [hash, {partials: {dude: dude, url: url}}], "Dudes: Yehuda <a href='http://yehuda'>http://yehuda</a> Alan <a href='http://alan'>http://alan</a> ", "Partials are rendered inside of other partials");
});

test("rendering undefined partial throws an exception", function() {
 var caught = false;
  try {
    var template = Handlebars.compile("{{> whatever}}"); 
    template();
  } catch (e) {
    if (e instanceof Handlebars.Exception) {
      caught = true;
    }
  }
  equals(caught, true);
});

module("safestring");

test("constructing a safestring from a string and checking its type", function() {
  var safe = new Handlebars.SafeString("testing 1, 2, 3");
  ok(safe instanceof Handlebars.SafeString, "SafeString is an instance of Handlebars.SafeString");
  equal(safe, "testing 1, 2, 3", "SafeString is equivalent to its underlying string");
});
