describe('data', function () {
  it('passing in data to a compiled function that expects data - works with helpers', function () {
    expectTemplate('{{hello}}')
      .withCompileOptions({ data: true })
      .withHelper('hello', function (options) {
        return options.data.adjective + ' ' + this.noun;
      })
      .withRuntimeOptions({ data: { adjective: 'happy' } })
      .withInput({ noun: 'cat' })
      .withMessage('Data output by helper')
      .toCompileTo('happy cat');
  });

  it('data can be looked up via @foo', function () {
    expectTemplate('{{@hello}}')
      .withRuntimeOptions({ data: { hello: 'hello' } })
      .withMessage('@foo retrieves template data')
      .toCompileTo('hello');
  });

  it('deep @foo triggers automatic top-level data', function () {
    var helpers = Handlebars.createFrame(handlebarsEnv.helpers);

    helpers.let = function (options) {
      var frame = Handlebars.createFrame(options.data);

      for (var prop in options.hash) {
        if (prop in options.hash) {
          frame[prop] = options.hash[prop];
        }
      }
      return options.fn(this, { data: frame });
    };

    expectTemplate(
      '{{#let world="world"}}{{#if foo}}{{#if foo}}Hello {{@world}}{{/if}}{{/if}}{{/let}}'
    )
      .withInput({ foo: true })
      .withHelpers(helpers)
      .withMessage('Automatic data was triggered')
      .toCompileTo('Hello world');
  });

  it('parameter data can be looked up via @foo', function () {
    expectTemplate('{{hello @world}}')
      .withRuntimeOptions({ data: { world: 'world' } })
      .withHelper('hello', function (noun) {
        return 'Hello ' + noun;
      })
      .withMessage('@foo as a parameter retrieves template data')
      .toCompileTo('Hello world');
  });

  it('hash values can be looked up via @foo', function () {
    expectTemplate('{{hello noun=@world}}')
      .withRuntimeOptions({ data: { world: 'world' } })
      .withHelper('hello', function (options) {
        return 'Hello ' + options.hash.noun;
      })
      .withMessage('@foo as a parameter retrieves template data')
      .toCompileTo('Hello world');
  });

  it('nested parameter data can be looked up via @foo.bar', function () {
    expectTemplate('{{hello @world.bar}}')
      .withRuntimeOptions({ data: { world: { bar: 'world' } } })
      .withHelper('hello', function (noun) {
        return 'Hello ' + noun;
      })
      .withMessage('@foo as a parameter retrieves template data')
      .toCompileTo('Hello world');
  });

  it('nested parameter data does not fail with @world.bar', function () {
    expectTemplate('{{hello @world.bar}}')
      .withRuntimeOptions({ data: { foo: { bar: 'world' } } })
      .withHelper('hello', function (noun) {
        return 'Hello ' + noun;
      })
      .withMessage('@foo as a parameter retrieves template data')
      .toCompileTo('Hello undefined');
  });

  it('parameter data throws when using complex scope references', function () {
    expectTemplate(
      '{{#goodbyes}}{{text}} cruel {{@foo/../name}}! {{/goodbyes}}'
    ).toThrow(Error);
  });

  it('data can be functions', function () {
    expectTemplate('{{@hello}}')
      .withRuntimeOptions({
        data: {
          hello: function () {
            return 'hello';
          },
        },
      })
      .toCompileTo('hello');
  });

  it('data can be functions with params', function () {
    expectTemplate('{{@hello "hello"}}')
      .withRuntimeOptions({
        data: {
          hello: function (arg) {
            return arg;
          },
        },
      })
      .toCompileTo('hello');
  });

  it('data is inherited downstream', function () {
    expectTemplate(
      '{{#let foo=1 bar=2}}{{#let foo=bar.baz}}{{@bar}}{{@foo}}{{/let}}{{@foo}}{{/let}}'
    )
      .withInput({ bar: { baz: 'hello world' } })
      .withCompileOptions({ data: true })
      .withHelper('let', function (options) {
        var frame = Handlebars.createFrame(options.data);
        for (var prop in options.hash) {
          if (prop in options.hash) {
            frame[prop] = options.hash[prop];
          }
        }
        return options.fn(this, { data: frame });
      })
      .withRuntimeOptions({ data: {} })
      .withMessage('data variables are inherited downstream')
      .toCompileTo('2hello world1');
  });

  it('passing in data to a compiled function that expects data - works with helpers in partials', function () {
    expectTemplate('{{>myPartial}}')
      .withCompileOptions({ data: true })
      .withPartial('myPartial', '{{hello}}')
      .withHelper('hello', function (options) {
        return options.data.adjective + ' ' + this.noun;
      })
      .withInput({ noun: 'cat' })
      .withRuntimeOptions({ data: { adjective: 'happy' } })
      .withMessage('Data output by helper inside partial')
      .toCompileTo('happy cat');
  });

  it('passing in data to a compiled function that expects data - works with helpers and parameters', function () {
    expectTemplate('{{hello world}}')
      .withCompileOptions({ data: true })
      .withHelper('hello', function (noun, options) {
        return options.data.adjective + ' ' + noun + (this.exclaim ? '!' : '');
      })
      .withInput({ exclaim: true, world: 'world' })
      .withRuntimeOptions({ data: { adjective: 'happy' } })
      .withMessage('Data output by helper')
      .toCompileTo('happy world!');
  });

  it('passing in data to a compiled function that expects data - works with block helpers', function () {
    expectTemplate('{{#hello}}{{world}}{{/hello}}')
      .withCompileOptions({
        data: true,
      })
      .withHelper('hello', function (options) {
        return options.fn(this);
      })
      .withHelper('world', function (options) {
        return options.data.adjective + ' world' + (this.exclaim ? '!' : '');
      })
      .withInput({ exclaim: true })
      .withRuntimeOptions({ data: { adjective: 'happy' } })
      .withMessage('Data output by helper')
      .toCompileTo('happy world!');
  });

  it('passing in data to a compiled function that expects data - works with block helpers that use ..', function () {
    expectTemplate('{{#hello}}{{world ../zomg}}{{/hello}}')
      .withCompileOptions({ data: true })
      .withHelper('hello', function (options) {
        return options.fn({ exclaim: '?' });
      })
      .withHelper('world', function (thing, options) {
        return options.data.adjective + ' ' + thing + (this.exclaim || '');
      })
      .withInput({ exclaim: true, zomg: 'world' })
      .withRuntimeOptions({ data: { adjective: 'happy' } })
      .withMessage('Data output by helper')
      .toCompileTo('happy world?');
  });

  it('passing in data to a compiled function that expects data - data is passed to with block helpers where children use ..', function () {
    expectTemplate('{{#hello}}{{world ../zomg}}{{/hello}}')
      .withCompileOptions({ data: true })
      .withHelper('hello', function (options) {
        return options.data.accessData + ' ' + options.fn({ exclaim: '?' });
      })
      .withHelper('world', function (thing, options) {
        return options.data.adjective + ' ' + thing + (this.exclaim || '');
      })
      .withInput({ exclaim: true, zomg: 'world' })
      .withRuntimeOptions({ data: { adjective: 'happy', accessData: '#win' } })
      .withMessage('Data output by helper')
      .toCompileTo('#win happy world?');
  });

  it('you can override inherited data when invoking a helper', function () {
    expectTemplate('{{#hello}}{{world zomg}}{{/hello}}')
      .withCompileOptions({ data: true })
      .withHelper('hello', function (options) {
        return options.fn(
          { exclaim: '?', zomg: 'world' },
          { data: { adjective: 'sad' } }
        );
      })
      .withHelper('world', function (thing, options) {
        return options.data.adjective + ' ' + thing + (this.exclaim || '');
      })
      .withInput({ exclaim: true, zomg: 'planet' })
      .withRuntimeOptions({ data: { adjective: 'happy' } })
      .withMessage('Overridden data output by helper')
      .toCompileTo('sad world?');
  });

  it('you can override inherited data when invoking a helper with depth', function () {
    expectTemplate('{{#hello}}{{world ../zomg}}{{/hello}}')
      .withCompileOptions({ data: true })
      .withHelper('hello', function (options) {
        return options.fn({ exclaim: '?' }, { data: { adjective: 'sad' } });
      })
      .withHelper('world', function (thing, options) {
        return options.data.adjective + ' ' + thing + (this.exclaim || '');
      })
      .withInput({ exclaim: true, zomg: 'world' })
      .withRuntimeOptions({ data: { adjective: 'happy' } })
      .withMessage('Overridden data output by helper')
      .toCompileTo('sad world?');
  });

  describe('@root', function () {
    it('the root context can be looked up via @root', function () {
      expectTemplate('{{@root.foo}}')
        .withInput({ foo: 'hello' })
        .withRuntimeOptions({ data: {} })
        .toCompileTo('hello');

      expectTemplate('{{@root.foo}}')
        .withInput({ foo: 'hello' })
        .toCompileTo('hello');
    });

    it('passed root values take priority', function () {
      expectTemplate('{{@root.foo}}')
        .withInput({ foo: 'should not be used' })
        .withRuntimeOptions({ data: { root: { foo: 'hello' } } })
        .toCompileTo('hello');
    });
  });

  describe('nesting', function () {
    it('the root context can be looked up via @root', function () {
      expectTemplate(
        '{{#helper}}{{#helper}}{{@./depth}} {{@../depth}} {{@../../depth}}{{/helper}}{{/helper}}'
      )
        .withInput({ foo: 'hello' })
        .withHelper('helper', function (options) {
          var frame = Handlebars.createFrame(options.data);
          frame.depth = options.data.depth + 1;
          return options.fn(this, { data: frame });
        })
        .withRuntimeOptions({
          data: {
            depth: 0,
          },
        })
        .toCompileTo('2 1 0');
    });
  });
});
