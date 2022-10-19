describe('blocks', function () {
  it('array', function () {
    var string = '{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!';

    expectTemplate(string)
      .withInput({
        goodbyes: [
          { text: 'goodbye' },
          { text: 'Goodbye' },
          { text: 'GOODBYE' },
        ],
        world: 'world',
      })
      .withMessage('Arrays iterate over the contents when not empty')
      .toCompileTo('goodbye! Goodbye! GOODBYE! cruel world!');

    expectTemplate(string)
      .withInput({
        goodbyes: [],
        world: 'world',
      })
      .withMessage('Arrays ignore the contents when empty')
      .toCompileTo('cruel world!');
  });

  it('array without data', function () {
    expectTemplate(
      '{{#goodbyes}}{{text}}{{/goodbyes}} {{#goodbyes}}{{text}}{{/goodbyes}}'
    )
      .withInput({
        goodbyes: [
          { text: 'goodbye' },
          { text: 'Goodbye' },
          { text: 'GOODBYE' },
        ],
        world: 'world',
      })
      .withCompileOptions({ compat: false })
      .toCompileTo('goodbyeGoodbyeGOODBYE goodbyeGoodbyeGOODBYE');
  });

  it('array with @index', function () {
    expectTemplate(
      '{{#goodbyes}}{{@index}}. {{text}}! {{/goodbyes}}cruel {{world}}!'
    )
      .withInput({
        goodbyes: [
          { text: 'goodbye' },
          { text: 'Goodbye' },
          { text: 'GOODBYE' },
        ],
        world: 'world',
      })
      .withMessage('The @index variable is used')
      .toCompileTo('0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!');
  });

  it('empty block', function () {
    var string = '{{#goodbyes}}{{/goodbyes}}cruel {{world}}!';

    expectTemplate(string)
      .withInput({
        goodbyes: [
          { text: 'goodbye' },
          { text: 'Goodbye' },
          { text: 'GOODBYE' },
        ],
        world: 'world',
      })
      .withMessage('Arrays iterate over the contents when not empty')
      .toCompileTo('cruel world!');

    expectTemplate(string)
      .withInput({
        goodbyes: [],
        world: 'world',
      })
      .withMessage('Arrays ignore the contents when empty')
      .toCompileTo('cruel world!');
  });

  it('block with complex lookup', function () {
    expectTemplate('{{#goodbyes}}{{text}} cruel {{../name}}! {{/goodbyes}}')
      .withInput({
        name: 'Alan',
        goodbyes: [
          { text: 'goodbye' },
          { text: 'Goodbye' },
          { text: 'GOODBYE' },
        ],
      })
      .withMessage(
        'Templates can access variables in contexts up the stack with relative path syntax'
      )
      .toCompileTo(
        'goodbye cruel Alan! Goodbye cruel Alan! GOODBYE cruel Alan! '
      );
  });

  it('multiple blocks with complex lookup', function () {
    expectTemplate('{{#goodbyes}}{{../name}}{{../name}}{{/goodbyes}}')
      .withInput({
        name: 'Alan',
        goodbyes: [
          { text: 'goodbye' },
          { text: 'Goodbye' },
          { text: 'GOODBYE' },
        ],
      })
      .toCompileTo('AlanAlanAlanAlanAlanAlan');
  });

  it('block with complex lookup using nested context', function () {
    expectTemplate(
      '{{#goodbyes}}{{text}} cruel {{foo/../name}}! {{/goodbyes}}'
    ).toThrow(Error);
  });

  it('block with deep nested complex lookup', function () {
    expectTemplate(
      '{{#outer}}Goodbye {{#inner}}cruel {{../sibling}} {{../../omg}}{{/inner}}{{/outer}}'
    )
      .withInput({
        omg: 'OMG!',
        outer: [{ sibling: 'sad', inner: [{ text: 'goodbye' }] }],
      })
      .toCompileTo('Goodbye cruel sad OMG!');
  });

  it('works with cached blocks', function () {
    expectTemplate(
      '{{#each person}}{{#with .}}{{first}} {{last}}{{/with}}{{/each}}'
    )
      .withCompileOptions({ data: false })
      .withInput({
        person: [
          { first: 'Alan', last: 'Johnson' },
          { first: 'Alan', last: 'Johnson' },
        ],
      })
      .toCompileTo('Alan JohnsonAlan Johnson');
  });

  describe('inverted sections', function () {
    it('inverted sections with unset value', function () {
      expectTemplate(
        '{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}'
      )
        .withMessage("Inverted section rendered when value isn't set.")
        .toCompileTo('Right On!');
    });

    it('inverted section with false value', function () {
      expectTemplate(
        '{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}'
      )
        .withInput({ goodbyes: false })
        .withMessage('Inverted section rendered when value is false.')
        .toCompileTo('Right On!');
    });

    it('inverted section with empty set', function () {
      expectTemplate(
        '{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}'
      )
        .withInput({ goodbyes: [] })
        .withMessage('Inverted section rendered when value is empty set.')
        .toCompileTo('Right On!');
    });

    it('block inverted sections', function () {
      expectTemplate('{{#people}}{{name}}{{^}}{{none}}{{/people}}')
        .withInput({ none: 'No people' })
        .toCompileTo('No people');
    });

    it('chained inverted sections', function () {
      expectTemplate('{{#people}}{{name}}{{else if none}}{{none}}{{/people}}')
        .withInput({ none: 'No people' })
        .toCompileTo('No people');

      expectTemplate(
        '{{#people}}{{name}}{{else if nothere}}fail{{else unless nothere}}{{none}}{{/people}}'
      )
        .withInput({ none: 'No people' })
        .toCompileTo('No people');

      expectTemplate(
        '{{#people}}{{name}}{{else if none}}{{none}}{{else}}fail{{/people}}'
      )
        .withInput({ none: 'No people' })
        .toCompileTo('No people');
    });

    it('chained inverted sections with mismatch', function () {
      expectTemplate(
        '{{#people}}{{name}}{{else if none}}{{none}}{{/if}}'
      ).toThrow(Error);
    });

    it('block inverted sections with empty arrays', function () {
      expectTemplate('{{#people}}{{name}}{{^}}{{none}}{{/people}}')
        .withInput({
          none: 'No people',
          people: [],
        })
        .toCompileTo('No people');
    });
  });

  describe('standalone sections', function () {
    it('block standalone else sections', function () {
      expectTemplate('{{#people}}\n{{name}}\n{{^}}\n{{none}}\n{{/people}}\n')
        .withInput({ none: 'No people' })
        .toCompileTo('No people\n');

      expectTemplate('{{#none}}\n{{.}}\n{{^}}\n{{none}}\n{{/none}}\n')
        .withInput({ none: 'No people' })
        .toCompileTo('No people\n');

      expectTemplate('{{#people}}\n{{name}}\n{{^}}\n{{none}}\n{{/people}}\n')
        .withInput({ none: 'No people' })
        .toCompileTo('No people\n');
    });

    it('block standalone else sections can be disabled', function () {
      expectTemplate('{{#people}}\n{{name}}\n{{^}}\n{{none}}\n{{/people}}\n')
        .withInput({ none: 'No people' })
        .withCompileOptions({ ignoreStandalone: true })
        .toCompileTo('\nNo people\n\n');

      expectTemplate('{{#none}}\n{{.}}\n{{^}}\nFail\n{{/none}}\n')
        .withInput({ none: 'No people' })
        .withCompileOptions({ ignoreStandalone: true })
        .toCompileTo('\nNo people\n\n');
    });

    it('block standalone chained else sections', function () {
      expectTemplate(
        '{{#people}}\n{{name}}\n{{else if none}}\n{{none}}\n{{/people}}\n'
      )
        .withInput({ none: 'No people' })
        .toCompileTo('No people\n');

      expectTemplate(
        '{{#people}}\n{{name}}\n{{else if none}}\n{{none}}\n{{^}}\n{{/people}}\n'
      )
        .withInput({ none: 'No people' })
        .toCompileTo('No people\n');
    });

    it('should handle nesting', function () {
      expectTemplate('{{#data}}\n{{#if true}}\n{{.}}\n{{/if}}\n{{/data}}\nOK.')
        .withInput({
          data: [1, 3, 5],
        })
        .toCompileTo('1\n3\n5\nOK.');
    });
  });

  describe('compat mode', function () {
    it('block with deep recursive lookup lookup', function () {
      expectTemplate(
        '{{#outer}}Goodbye {{#inner}}cruel {{omg}}{{/inner}}{{/outer}}'
      )
        .withInput({ omg: 'OMG!', outer: [{ inner: [{ text: 'goodbye' }] }] })
        .withCompileOptions({ compat: true })
        .toCompileTo('Goodbye cruel OMG!');
    });

    it('block with deep recursive pathed lookup', function () {
      expectTemplate(
        '{{#outer}}Goodbye {{#inner}}cruel {{omg.yes}}{{/inner}}{{/outer}}'
      )
        .withInput({
          omg: { yes: 'OMG!' },
          outer: [{ inner: [{ yes: 'no', text: 'goodbye' }] }],
        })
        .withCompileOptions({ compat: true })
        .toCompileTo('Goodbye cruel OMG!');
    });

    it('block with missed recursive lookup', function () {
      expectTemplate(
        '{{#outer}}Goodbye {{#inner}}cruel {{omg.yes}}{{/inner}}{{/outer}}'
      )
        .withInput({
          omg: { no: 'OMG!' },
          outer: [{ inner: [{ yes: 'no', text: 'goodbye' }] }],
        })
        .withCompileOptions({ compat: true })
        .toCompileTo('Goodbye cruel ');
    });
  });

  describe('decorators', function () {
    it('should apply mustache decorators', function () {
      expectTemplate('{{#helper}}{{*decorator}}{{/helper}}')
        .withHelper('helper', function (options) {
          return options.fn.run;
        })
        .withDecorator('decorator', function (fn) {
          fn.run = 'success';
          return fn;
        })
        .toCompileTo('success');
    });

    it('should apply allow undefined return', function () {
      expectTemplate('{{#helper}}{{*decorator}}suc{{/helper}}')
        .withHelper('helper', function (options) {
          return options.fn() + options.fn.run;
        })
        .withDecorator('decorator', function (fn) {
          fn.run = 'cess';
        })
        .toCompileTo('success');
    });

    it('should apply block decorators', function () {
      expectTemplate(
        '{{#helper}}{{#*decorator}}success{{/decorator}}{{/helper}}'
      )
        .withHelper('helper', function (options) {
          return options.fn.run;
        })
        .withDecorator('decorator', function (fn, props, container, options) {
          fn.run = options.fn();
          return fn;
        })
        .toCompileTo('success');
    });

    it('should support nested decorators', function () {
      expectTemplate(
        '{{#helper}}{{#*decorator}}{{#*nested}}suc{{/nested}}cess{{/decorator}}{{/helper}}'
      )
        .withHelper('helper', function (options) {
          return options.fn.run;
        })
        .withDecorators({
          decorator: function (fn, props, container, options) {
            fn.run = options.fn.nested + options.fn();
            return fn;
          },
          nested: function (fn, props, container, options) {
            props.nested = options.fn();
          },
        })
        .toCompileTo('success');
    });

    it('should apply multiple decorators', function () {
      expectTemplate(
        '{{#helper}}{{#*decorator}}suc{{/decorator}}{{#*decorator}}cess{{/decorator}}{{/helper}}'
      )
        .withHelper('helper', function (options) {
          return options.fn.run;
        })
        .withDecorator('decorator', function (fn, props, container, options) {
          fn.run = (fn.run || '') + options.fn();
          return fn;
        })
        .toCompileTo('success');
    });

    it('should access parent variables', function () {
      expectTemplate('{{#helper}}{{*decorator foo}}{{/helper}}')
        .withHelper('helper', function (options) {
          return options.fn.run;
        })
        .withDecorator('decorator', function (fn, props, container, options) {
          fn.run = options.args;
          return fn;
        })
        .withInput({ foo: 'success' })
        .toCompileTo('success');
    });

    it('should work with root program', function () {
      var run;
      expectTemplate('{{*decorator "success"}}')
        .withDecorator('decorator', function (fn, props, container, options) {
          equals(options.args[0], 'success');
          run = true;
          return fn;
        })
        .withInput({ foo: 'success' })
        .toCompileTo('');
      equals(run, true);
    });

    it('should fail when accessing variables from root', function () {
      var run;
      expectTemplate('{{*decorator foo}}')
        .withDecorator('decorator', function (fn, props, container, options) {
          equals(options.args[0], undefined);
          run = true;
          return fn;
        })
        .withInput({ foo: 'fail' })
        .toCompileTo('');
      equals(run, true);
    });

    describe('registration', function () {
      it('unregisters', function () {
        handlebarsEnv.decorators = {};

        handlebarsEnv.registerDecorator('foo', function () {
          return 'fail';
        });

        equals(!!handlebarsEnv.decorators.foo, true);
        handlebarsEnv.unregisterDecorator('foo');
        equals(handlebarsEnv.decorators.foo, undefined);
      });

      it('allows multiple globals', function () {
        handlebarsEnv.decorators = {};

        handlebarsEnv.registerDecorator({
          foo: function () {},
          bar: function () {},
        });

        equals(!!handlebarsEnv.decorators.foo, true);
        equals(!!handlebarsEnv.decorators.bar, true);
        handlebarsEnv.unregisterDecorator('foo');
        handlebarsEnv.unregisterDecorator('bar');
        equals(handlebarsEnv.decorators.foo, undefined);
        equals(handlebarsEnv.decorators.bar, undefined);
      });

      it('fails with multiple and args', function () {
        shouldThrow(
          function () {
            handlebarsEnv.registerDecorator(
              {
                world: function () {
                  return 'world!';
                },
                testHelper: function () {
                  return 'found it!';
                },
              },
              {}
            );
          },
          Error,
          'Arg not supported with multiple decorators'
        );
      });
    });
  });
});
