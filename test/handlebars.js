module("basic context");

test("compiling with a basic context", function() {
  var string   = "Goodbye\n{{cruel}}\n{{world}}!";
  var template = Handlebars.compile(string);

  result = template({cruel: "cruel", world: "world"});
  equal(result, "Goodbye\ncruel\nworld!", "it works if all the required keys are provided");
});

test("comments", function() {
  var string   = "{{! Goodbye}}Goodbye\n{{cruel}}\n{{world}}!";
  var template = Handlebars.compile(string);

  result = template({cruel: "cruel", world: "world"});
  equal("Goodbye\ncruel\nworld!", result, "it works if all the required keys are provided");
});

test("boolean", function() {
  var string   = "{{#goodbye}}GOODBYE {{/goodbye}}cruel {{world}}!"
  var template = Handlebars.compile(string);

  result = template({goodbye: true, world: "world"});
  equal("GOODBYE cruel world!", result, "booleans work when true");

  result = template({goodbye: false, world: "world"});
  equal("cruel world!", result, "booleans work when true");
});
