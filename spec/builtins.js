/*global CompilerContext, shouldCompileTo, compileWithPartials */
describe('builtin helpers', function() {
  var originalLog = Handlebars.log;
  afterEach(function() {
    Handlebars.log = originalLog;
  });

  describe('#if', function() {
    it("if", function() {
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

    it("if with function argument", function() {
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
  });

  describe('#with', function() {
    it("with", function() {
      var string = "{{#with person}}{{first}} {{last}}{{/with}}";
      shouldCompileTo(string, {person: {first: "Alan", last: "Johnson"}}, "Alan Johnson");
    });
    it("with with function argument", function() {
      var string = "{{#with person}}{{first}} {{last}}{{/with}}";
      shouldCompileTo(string, {person: function() { return {first: "Alan", last: "Johnson"};}}, "Alan Johnson");
    });
  });

  describe('#each', function() {
    it("each", function() {
      var string   = "{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!";
      var hash     = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};
      shouldCompileTo(string, hash, "goodbye! Goodbye! GOODBYE! cruel world!",
                      "each with array argument iterates over the contents when not empty");
      shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                      "each with array argument ignores the contents when empty");
    });

    it("each with an object and @key", function() {
      var string   = "{{#each goodbyes}}{{@key}}. {{text}}! {{/each}}cruel {{world}}!";
      var hash     = {goodbyes: {"<b>#1</b>": {text: "goodbye"}, 2: {text: "GOODBYE"}}, world: "world"};

      // Object property iteration order is undefined according to ECMA spec,
      // so we need to check both possible orders
      // @see http://stackoverflow.com/questions/280713/elements-order-in-a-for-in-loop
      var actual = compileWithPartials(string, hash);
      var expected1 = "&lt;b&gt;#1&lt;/b&gt;. goodbye! 2. GOODBYE! cruel world!";
      var expected2 = "2. GOODBYE! &lt;b&gt;#1&lt;/b&gt;. goodbye! cruel world!";

      (actual === expected1 || actual === expected2).should.equal(true, "each with object argument iterates over the contents when not empty");
      shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                      "each with object argument ignores the contents when empty");
    });

    it("each with @index", function() {
      var string = "{{#each goodbyes}}{{@index}}. {{text}}! {{/each}}cruel {{world}}!";
      var hash   = {goodbyes: [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}], world: "world"};

      var template = CompilerContext.compile(string);
      var result = template(hash);

      equal(result, "0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!", "The @index variable is used");
    });

    it("each with function argument", function() {
      var string = "{{#each goodbyes}}{{text}}! {{/each}}cruel {{world}}!";
      var hash   = {goodbyes: function () { return [{text: "goodbye"}, {text: "Goodbye"}, {text: "GOODBYE"}];}, world: "world"};
      shouldCompileTo(string, hash, "goodbye! Goodbye! GOODBYE! cruel world!",
                "each with array function argument iterates over the contents when not empty");
      shouldCompileTo(string, {goodbyes: [], world: "world"}, "cruel world!",
                "each with array function argument ignores the contents when empty");
    });

    it("data passed to helpers", function() {
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
  });

  it("#log", function() {

    var string = "{{log blah}}";
    var hash   = { blah: "whee" };

    var levelArg, logArg;
    Handlebars.log = function(level, arg){ levelArg = level, logArg = arg; };

    shouldCompileTo(string, hash, "", "log should not display");
    equals(1, levelArg, "should call log with 1");
    equals("whee", logArg, "should call log with 'whee'");
  });

});
