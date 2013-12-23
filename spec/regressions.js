/*global CompilerContext, Handlebars, shouldCompileTo, shouldThrow */
describe('Regressions', function() {
  it("GH-94: Cannot read property of undefined", function() {
    var data = {"books":[{"title":"The origin of species","author":{"name":"Charles Darwin"}},{"title":"Lazarillo de Tormes"}]};
    var string = "{{#books}}{{title}}{{author.name}}{{/books}}";
    shouldCompileTo(string, data, "The origin of speciesCharles DarwinLazarillo de Tormes",
                    "Renders without an undefined property error");
  });

  it("GH-150: Inverted sections print when they shouldn't", function() {
    var string = "{{^set}}not set{{/set}} :: {{#set}}set{{/set}}";

    shouldCompileTo(string, {}, "not set :: ", "inverted sections run when property isn't present in context");
    shouldCompileTo(string, {set: undefined}, "not set :: ", "inverted sections run when property is undefined");
    shouldCompileTo(string, {set: false}, "not set :: ", "inverted sections run when property is false");
    shouldCompileTo(string, {set: true}, " :: set", "inverted sections don't run when property is true");
  });

  it("GH-158: Using array index twice, breaks the template", function() {
    var string = "{{arr.[0]}}, {{arr.[1]}}";
    var data = { "arr": [1,2] };

    shouldCompileTo(string, data, "1, 2", "it works as expected");
  });

  it("bug reported by @fat where lambdas weren't being properly resolved", function() {
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

  it('GH-408: Multiple loops fail', function() {
    var context = [
      { name: "John Doe", location: { city: "Chicago" } },
      { name: "Jane Doe", location: { city: "New York"} }
    ];

    var template = CompilerContext.compile('{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}');

    var result = template(context);
    equals(result, "John DoeJane DoeJohn DoeJane DoeJohn DoeJane Doe", 'It should output multiple times');
  });

  it('GS-428: Nested if else rendering', function() {
    var succeedingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}}  {{#blk}} Expected {{/blk}} {{/inverse}}';
    var failingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}} {{#blk}} Expected {{/blk}} {{/inverse}}';

    var helpers = {
      blk: function(block) { return block.fn(''); },
      inverse: function(block) { return block.inverse(''); }
    };

    shouldCompileTo(succeedingTemplate, [{}, helpers], '   Expected  ');
    shouldCompileTo(failingTemplate, [{}, helpers], '  Expected  ');
  });

  it('GH-458: Scoped this identifier', function() {
    shouldCompileTo('{{./foo}}', {foo: 'bar'}, 'bar');
  });

  it('GH-375: Unicode line terminators', function() {
    shouldCompileTo('\u2028', {}, '\u2028');
  });

  it('GH-534: Object prototype aliases', function() {
    Object.prototype[0xD834] = true;

    shouldCompileTo('{{foo}}', { foo: 'bar' }, 'bar');

    delete Object.prototype[0xD834];
  });

  it('GH-437: Matching escaping', function() {
    shouldThrow(function() {
      CompilerContext.compile('{{{a}}');
    }, Error);
    shouldThrow(function() {
      CompilerContext.compile('{{a}}}');
    }, Error);
  });

  it("GH-676: Using array in escaping mustache fails", function() {
    var string = "{{arr}}";
    var data = { "arr": [1,2] };

    shouldCompileTo(string, data, data.arr.toString(), "it works as expected");
  });

  it("Mustache man page", function() {
    var string = "Hello {{name}}. You have just won ${{value}}!{{#in_ca}} Well, ${{taxed_value}}, after taxes.{{/in_ca}}";
    var data = {
      "name": "Chris",
      "value": 10000,
      "taxed_value": 10000 - (10000 * 0.4),
      "in_ca": true
    };

    shouldCompileTo(string, data, "Hello Chris. You have just won $10000! Well, $6000, after taxes.", "the hello world mustache example works");
  });

  it("Passing falsy values to Handlebars.compile throws an error", function() {
    shouldThrow(function() {
      CompilerContext.compile(null);
    }, Error, 'You must pass a string or Handlebars AST to Handlebars.precompile. You passed null');
  });

  if (Handlebars.AST) {
    it("can pass through an already-compiled AST via compile/precompile", function() {
      equal(Handlebars.compile(new Handlebars.AST.ProgramNode([ new Handlebars.AST.ContentNode("Hello")]))(), 'Hello');
    });

    it("can pass through an empty string", function() {
      equal(Handlebars.compile('')(), '');
    });
  }
});
