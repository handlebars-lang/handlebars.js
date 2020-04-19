describe('data', function() {
  it('passing in data to a compiled function that expects data - works with helpers', function() {
    var string = '{{hello}}';

    var helpers = {
      hello: function(options) {
        return options.data.adjective + ' ' + this.noun;
      }
    };

    expectTemplate(string)
      .withCompileOptions({ data: true })
      .withHelpers(helpers)
      .withRuntimeOptions({ data: { adjective: 'happy' } })
      .withInput({ noun: 'cat' })
      .withMessage('Data output by helper')
      .toCompileTo('happy cat');
  });

  it('data can be looked up via @foo', function() {
    expectTemplate('{{@hello}}')
      .withRuntimeOptions({ data: { hello: 'hello' } })
      .withMessage('@foo retrieves template data')
      .toCompileTo('hello');
  });

  it('deep @foo triggers automatic top-level data', function() {
    var string =
      '{{#let world="world"}}{{#if foo}}{{#if foo}}Hello {{@world}}{{/if}}{{/if}}{{/let}}';

    var helpers = Handlebars.createFrame(handlebarsEnv.helpers);

    helpers.let = function(options) {
      var frame = Handlebars.createFrame(options.data);

      for (var prop in options.hash) {
        if (prop in options.hash) {
          frame[prop] = options.hash[prop];
        }
      }
      return options.fn(this, { data: frame });
    };

    expectTemplate(string)
      .withInput({ foo: true })
      .withHelpers(helpers)
      .withMessage('Automatic data was triggered')
      .toCompileTo('Hello world');
  });

  it('parameter data can be looked up via @foo', function() {
    var string = '{{hello @world}}';
    var helpers = {
      hello: function(noun) {
        return 'Hello ' + noun;
      }
    };

    expectTemplate(string)
      .withRuntimeOptions({ data: { world: 'world' } })
      .withHelpers(helpers)
      .withMessage('@foo as a parameter retrieves template data')
      .toCompileTo('Hello world');
  });

  it('hash values can be looked up via @foo', function() {
    var string = '{{hello noun=@world}}';
    var helpers = {
      hello: function(options) {
        return 'Hello ' + options.hash.noun;
      }
    };

    expectTemplate(string)
      .withRuntimeOptions({ data: { world: 'world' } })
      .withHelpers(helpers)
      .withMessage('@foo as a parameter retrieves template data')
      .toCompileTo('Hello world');
  });

  it('nested parameter data can be looked up via @foo.bar', function() {
    var string = '{{hello @world.bar}}';
    var helpers = {
      hello: function(noun) {
        return 'Hello ' + noun;
      }
    };

    expectTemplate(string)
      .withRuntimeOptions({ data: { world: { bar: 'world' } } })
      .withHelpers(helpers)
      .withMessage('@foo as a parameter retrieves template data')
      .toCompileTo('Hello world');
  });

  it('nested parameter data does not fail with @world.bar', function() {
    var string = '{{hello @world.bar}}';
    var helpers = {
      hello: function(noun) {
        return 'Hello ' + noun;
      }
    };

    expectTemplate(string)
      .withRuntimeOptions({ data: { foo: { bar: 'world' } } })
      .withHelpers(helpers)
      .withMessage('@foo as a parameter retrieves template data')
      .toCompileTo('Hello undefined');
  });

  it('parameter data throws when using complex scope references', function() {
    var string = '{{#goodbyes}}{{text}} cruel {{@foo/../name}}! {{/goodbyes}}';

    expectTemplate(string).toThrow(Error);
  });

  it('data can be functions', function() {
    var string = '{{@hello}}';
    var runtimeOptions = {
      data: {
        hello: function() {
          return 'hello';
        }
      }
    };

    expectTemplate(string)
      .withRuntimeOptions(runtimeOptions)
      .toCompileTo('hello');
  });

  it('data can be functions with params', function() {
    var string = '{{@hello "hello"}}';
    var runtimeOptions = {
      data: {
        hello: function(arg) {
          return arg;
        }
      }
    };

    expectTemplate(string)
      .withRuntimeOptions(runtimeOptions)
      .toCompileTo('hello');
  });

  it('data is inherited downstream', function() {
    var string =
      '{{#let foo=1 bar=2}}{{#let foo=bar.baz}}{{@bar}}{{@foo}}{{/let}}{{@foo}}{{/let}}';
    var compileOptions = { data: true };
    var helpers = {
      let: function(options) {
        var frame = Handlebars.createFrame(options.data);
        for (var prop in options.hash) {
          if (prop in options.hash) {
            frame[prop] = options.hash[prop];
          }
        }
        return options.fn(this, { data: frame });
      }
    };

    expectTemplate(string)
      .withInput({ bar: { baz: 'hello world' } })
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withRuntimeOptions({ data: {} })
      .withMessage('data variables are inherited downstream')
      .toCompileTo('2hello world1');
  });

  it('passing in data to a compiled function that expects data - works with helpers in partials', function() {
    var string = '{{>myPartial}}';
    var compileOptions = { data: true };

    var partials = {
      myPartial: CompilerContext.compile('{{hello}}', { data: true })
    };

    var helpers = {
      hello: function(options) {
        return options.data.adjective + ' ' + this.noun;
      }
    };

    var input = { noun: 'cat' };
    var runtimeOptions = { data: { adjective: 'happy' } };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withPartials(partials)
      .withHelpers(helpers)
      .withInput(input)
      .withRuntimeOptions(runtimeOptions)
      .withMessage('Data output by helper inside partial')
      .toCompileTo('happy cat');
  });

  it('passing in data to a compiled function that expects data - works with helpers and parameters', function() {
    var string = '{{hello world}}';
    var compileOptions = { data: true };

    var helpers = {
      hello: function(noun, options) {
        return options.data.adjective + ' ' + noun + (this.exclaim ? '!' : '');
      }
    };

    var input = { exclaim: true, world: 'world' };
    var runtimeOptions = { data: { adjective: 'happy' } };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(input)
      .withRuntimeOptions(runtimeOptions)
      .withMessage('Data output by helper')
      .toCompileTo('happy world!');
  });

  it('passing in data to a compiled function that expects data - works with block helpers', function() {
    var string = '{{#hello}}{{world}}{{/hello}}';
    var compileOptions = {
      data: true
    };

    var helpers = {
      hello: function(options) {
        return options.fn(this);
      },
      world: function(options) {
        return options.data.adjective + ' world' + (this.exclaim ? '!' : '');
      }
    };

    var input = { exclaim: true };
    var runtimeOptions = { data: { adjective: 'happy' } };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(input)
      .withRuntimeOptions(runtimeOptions)
      .withMessage('Data output by helper')
      .toCompileTo('happy world!');
  });

  it('passing in data to a compiled function that expects data - works with block helpers that use ..', function() {
    var string = '{{#hello}}{{world ../zomg}}{{/hello}}';
    var compileOptions = { data: true };

    var helpers = {
      hello: function(options) {
        return options.fn({ exclaim: '?' });
      },
      world: function(thing, options) {
        return options.data.adjective + ' ' + thing + (this.exclaim || '');
      }
    };

    var input = { exclaim: true, zomg: 'world' };
    var runtimeOptions = { data: { adjective: 'happy' } };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(input)
      .withRuntimeOptions(runtimeOptions)
      .withMessage('Data output by helper')
      .toCompileTo('happy world?');
  });

  it('passing in data to a compiled function that expects data - data is passed to with block helpers where children use ..', function() {
    var string = '{{#hello}}{{world ../zomg}}{{/hello}}';
    var compileOptions = { data: true };

    var helpers = {
      hello: function(options) {
        return options.data.accessData + ' ' + options.fn({ exclaim: '?' });
      },
      world: function(thing, options) {
        return options.data.adjective + ' ' + thing + (this.exclaim || '');
      }
    };

    var input = { exclaim: true, zomg: 'world' };
    var runtimeOptions = { data: { adjective: 'happy', accessData: '#win' } };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(input)
      .withRuntimeOptions(runtimeOptions)
      .withMessage('Data output by helper')
      .toCompileTo('#win happy world?');
  });

  it('you can override inherited data when invoking a helper', function() {
    var string = '{{#hello}}{{world zomg}}{{/hello}}';
    var compileOptions = { data: true };

    var helpers = {
      hello: function(options) {
        return options.fn(
          { exclaim: '?', zomg: 'world' },
          { data: { adjective: 'sad' } }
        );
      },
      world: function(thing, options) {
        return options.data.adjective + ' ' + thing + (this.exclaim || '');
      }
    };

    var input = { exclaim: true, zomg: 'planet' };
    var runtimeOptions = { data: { adjective: 'happy' } };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(input)
      .withRuntimeOptions(runtimeOptions)
      .withMessage('Overriden data output by helper')
      .toCompileTo('sad world?');
  });

  it('you can override inherited data when invoking a helper with depth', function() {
    var string = '{{#hello}}{{world ../zomg}}{{/hello}}';
    var compileOptions = { data: true };

    var helpers = {
      hello: function(options) {
        return options.fn({ exclaim: '?' }, { data: { adjective: 'sad' } });
      },
      world: function(thing, options) {
        return options.data.adjective + ' ' + thing + (this.exclaim || '');
      }
    };

    var input = { exclaim: true, zomg: 'world' };
    var runtimeOptions = { data: { adjective: 'happy' } };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(input)
      .withRuntimeOptions(runtimeOptions)
      .withMessage('Overriden data output by helper')
      .toCompileTo('sad world?');
  });

  describe('@root', function() {
    it('the root context can be looked up via @root', function() {
      var string = '{{@root.foo}}';
      var input = { foo: 'hello' };

      expectTemplate(string)
        .withInput(input)
        .withRuntimeOptions({ data: {} })
        .toCompileTo('hello');

      expectTemplate(string)
        .withInput(input)
        .toCompileTo('hello');
    });
    it('passed root values take priority', function() {
      var string = '{{@root.foo}}';
      var runtimeOptions = { data: { root: { foo: 'hello' } } };
      expectTemplate(string)
        .withRuntimeOptions(runtimeOptions)
        .toCompileTo('hello');
    });
  });

  describe('nesting', function() {
    it('the root context can be looked up via @root', function() {
      var string =
        '{{#helper}}{{#helper}}{{@./depth}} {{@../depth}} {{@../../depth}}{{/helper}}{{/helper}}';
      var input = { foo: 'hello' };
      var helpers = {
        helper: function(options) {
          var frame = Handlebars.createFrame(options.data);
          frame.depth = options.data.depth + 1;
          return options.fn(this, { data: frame });
        }
      };
      var runtimeOptions = {
        data: {
          depth: 0
        }
      };
      expectTemplate(string)
        .withInput(input)
        .withHelpers(helpers)
        .withRuntimeOptions(runtimeOptions)
        .toCompileTo('2 1 0');
    });
  });
});
