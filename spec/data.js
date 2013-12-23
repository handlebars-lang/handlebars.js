/*global CompilerContext, Handlebars, handlebarsEnv, shouldThrow */
describe('data', function() {
  it("passing in data to a compiled function that expects data - works with helpers", function() {
    var template = CompilerContext.compile("{{hello}}", {data: true});

    var helpers = {
      hello: function(options) {
        return options.data.adjective + " "  + this.noun;
      }
    };

    var result = template({noun: "cat"}, {helpers: helpers, data: {adjective: "happy"}});
    equals("happy cat", result, "Data output by helper");
  });

  it("data can be looked up via @foo", function() {
    var template = CompilerContext.compile("{{@hello}}");
    var result = template({}, { data: { hello: "hello" } });
    equals("hello", result, "@foo retrieves template data");
  });

  it("deep @foo triggers automatic top-level data", function() {
    var template = CompilerContext.compile('{{#let world="world"}}{{#if foo}}{{#if foo}}Hello {{@world}}{{/if}}{{/if}}{{/let}}');

    var helpers = Handlebars.createFrame(handlebarsEnv.helpers);

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

  it("parameter data can be looked up via @foo", function() {
    var template = CompilerContext.compile("{{hello @world}}");
    var helpers = {
      hello: function(noun) {
        return "Hello " + noun;
      }
    };

    var result = template({}, { helpers: helpers, data: { world: "world" } });
    equals("Hello world", result, "@foo as a parameter retrieves template data");
  });

  it("hash values can be looked up via @foo", function() {
    var template = CompilerContext.compile("{{hello noun=@world}}");
    var helpers = {
      hello: function(options) {
        return "Hello " + options.hash.noun;
      }
    };

    var result = template({}, { helpers: helpers, data: { world: "world" } });
    equals("Hello world", result, "@foo as a parameter retrieves template data");
  });

  it("nested parameter data can be looked up via @foo.bar", function() {
    var template = CompilerContext.compile("{{hello @world.bar}}");
    var helpers = {
      hello: function(noun) {
        return "Hello " + noun;
      }
    };

    var result = template({}, { helpers: helpers, data: { world: {bar: "world" } } });
    equals("Hello world", result, "@foo as a parameter retrieves template data");
  });

  it("nested parameter data does not fail with @world.bar", function() {
    var template = CompilerContext.compile("{{hello @world.bar}}");
    var helpers = {
      hello: function(noun) {
        return "Hello " + noun;
      }
    };

    var result = template({}, { helpers: helpers, data: { foo: {bar: "world" } } });
    equals("Hello undefined", result, "@foo as a parameter retrieves template data");
  });

  it("parameter data throws when using this scope references", function() {
    var string = "{{#goodbyes}}{{text}} cruel {{@./name}}! {{/goodbyes}}";

    shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error);
  });

  it("parameter data throws when using parent scope references", function() {
    var string = "{{#goodbyes}}{{text}} cruel {{@../name}}! {{/goodbyes}}";

    shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error);
  });

  it("parameter data throws when using complex scope references", function() {
    var string = "{{#goodbyes}}{{text}} cruel {{@foo/../name}}! {{/goodbyes}}";

    shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error);
  });

  it("data is inherited downstream", function() {
    var template = CompilerContext.compile("{{#let foo=1 bar=2}}{{#let foo=bar.baz}}{{@bar}}{{@foo}}{{/let}}{{@foo}}{{/let}}", { data: true });
    var helpers = {
      let: function(options) {
        var frame = Handlebars.createFrame(options.data);
        for (var prop in options.hash) {
          frame[prop] = options.hash[prop];
        }
        return options.fn(this, {data: frame});
      }
    };

    var result = template({ bar: { baz: "hello world" } }, { helpers: helpers, data: {} });
    equals("2hello world1", result, "data variables are inherited downstream");
  });

  it("passing in data to a compiled function that expects data - works with helpers in partials", function() {
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

  it("passing in data to a compiled function that expects data - works with helpers and parameters", function() {
    var template = CompilerContext.compile("{{hello world}}", {data: true});

    var helpers = {
      hello: function(noun, options) {
        return options.data.adjective + " "  + noun + (this.exclaim ? "!" : "");
      }
    };

    var result = template({exclaim: true, world: "world"}, {helpers: helpers, data: {adjective: "happy"}});
    equals("happy world!", result, "Data output by helper");
  });

  it("passing in data to a compiled function that expects data - works with block helpers", function() {
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

  it("passing in data to a compiled function that expects data - works with block helpers that use ..", function() {
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

  it("passing in data to a compiled function that expects data - data is passed to with block helpers where children use ..", function() {
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

  it("you can override inherited data when invoking a helper", function() {
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


  it("you can override inherited data when invoking a helper with depth", function() {
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

});
