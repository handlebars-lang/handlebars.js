jQuery(function($) {

  module("basic context");

  test("compiling with a basic context", function() {
    var string   = "Goodbye\n{{cruel}}\n{{world}}";
    var template = Handlebars.compile(string);

    result = template({cruel: "cruel", world: "world"});
    equal("Goodbye\ncruel\nworld", result, "it works if all the required keys are provided");
  });

});
