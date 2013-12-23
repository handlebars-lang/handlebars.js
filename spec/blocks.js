/*global CompilerContext, shouldCompileTo */
describe('blocks', function() {
  it("array", function() {
    var string   = "{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!";
    var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
    shouldCompileTo(string, hash, "goodbye! Goodbye! GOODBYE! cruel world!",
                    "Arrays iterate over the contents when not empty");

    shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                    "Arrays ignore the contents when empty");

  });

  it("array with @index", function() {
    var string = "{{#goodbyes}}{{@index}}. {{text}}! {{/goodbyes}}cruel {{world}}!";
    var hash   = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};

    var template = CompilerContext.compile(string);
    var result = template(hash);

    equal(result, "0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!", "The @index variable is used");
  });

  it("empty block", function() {
    var string   = "{{#goodbyes}}{{/goodbyes}}cruel {{world}}!";
    var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
    shouldCompileTo(string, hash, "cruel world!",
                    "Arrays iterate over the contents when not empty");

    shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                    "Arrays ignore the contents when empty");
  });

  it("block with complex lookup", function() {
    var string = "{{#goodbyes}}{{text}} cruel {{../name}}! {{/goodbyes}}";
    var hash     = {name: "Alan", goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}]};

    shouldCompileTo(string, hash, "goodbye cruel Alan! Goodbye cruel Alan! GOODBYE cruel Alan! ",
                    "Templates can access variables in contexts up the stack with relative path syntax");
  });

  it("block with complex lookup using nested context", function() {
    var string = "{{#goodbyes}}{{text}} cruel {{foo/../name}}! {{/goodbyes}}";

    shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error);
  });

  it("block with deep nested complex lookup", function() {
    var string = "{{#outer}}Goodbye {{#inner}}cruel {{../../omg}}{{/inner}}{{/outer}}";
    var hash = {omg: "OMG!", outer: [{ inner: [{ text: "goodbye" }] }] };

    shouldCompileTo(string, hash, "Goodbye cruel OMG!");
  });

  describe('inverted sections', function() {
    it("inverted sections with unset value", function() {
      var string = "{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}";
      var hash = {};
      shouldCompileTo(string, hash, "Right On!", "Inverted section rendered when value isn't set.");
    });

    it("inverted section with false value", function() {
      var string = "{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}";
      var hash = {goodbyes: false};
      shouldCompileTo(string, hash, "Right On!", "Inverted section rendered when value is false.");
    });

    it("inverted section with empty set", function() {
      var string = "{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}";
      var hash = {goodbyes: []};
      shouldCompileTo(string, hash, "Right On!", "Inverted section rendered when value is empty set.");
    });

    it("block inverted sections", function() {
      shouldCompileTo("{{#people}}{{name}}{{^}}{{none}}{{/people}}", {none: "No people"},
        "No people");
    });

    it("block inverted sections with empty arrays", function() {
      shouldCompileTo("{{#people}}{{name}}{{^}}{{none}}{{/people}}", {none: "No people", people: []},
        "No people");
    });
  });
});
