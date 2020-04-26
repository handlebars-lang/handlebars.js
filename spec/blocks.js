describe('blocks', function() {
  it('array', function() {
    var string = '{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!';
    var hash = {
      goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
      world: 'world'
    };
    expectTemplate(string)
      .withInput(hash)
      .withMessage('Arrays iterate over the contents when not empty')
      .toCompileTo('goodbye! Goodbye! GOODBYE! cruel world!');

    expectTemplate(string)
      .withInput({
        goodbyes: [],
        world: 'world'
      })
      .withMessage('Arrays ignore the contents when empty')
      .toCompileTo('cruel world!');
  });

  it('array without data', function() {
    var string =
      '{{#goodbyes}}{{text}}{{/goodbyes}} {{#goodbyes}}{{text}}{{/goodbyes}}';
    var hash = {
      goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
      world: 'world'
    };
    expectTemplate(string)
      .withInput(hash)
      .withCompileOptions({ compat: false })
      .toCompileTo('goodbyeGoodbyeGOODBYE goodbyeGoodbyeGOODBYE');
  });

  it('array with @index', function() {
    var string =
      '{{#goodbyes}}{{@index}}. {{text}}! {{/goodbyes}}cruel {{world}}!';
    var hash = {
      goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
      world: 'world'
    };

    expectTemplate(string)
      .withInput(hash)
      .withMessage('The @index variable is used')
      .toCompileTo('0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!');
  });

  it('empty block', function() {
    var string = '{{#goodbyes}}{{/goodbyes}}cruel {{world}}!';
    var hash = {
      goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
      world: 'world'
    };
    expectTemplate(string)
      .withInput(hash)
      .withMessage('Arrays iterate over the contents when not empty')
      .toCompileTo('cruel world!');

    expectTemplate(string)
      .withInput({
        goodbyes: [],
        world: 'world'
      })
      .withMessage('Arrays ignore the contents when empty')
      .toCompileTo('cruel world!');
  });

  it('block with complex lookup', function() {
    var string = '{{#goodbyes}}{{text}} cruel {{../name}}! {{/goodbyes}}';
    var hash = {
      name: 'Alan',
      goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }]
    };

    expectTemplate(string)
      .withInput(hash)
      .withMessage(
        'Templates can access variables in contexts up the stack with relative path syntax'
      )
      .toCompileTo(
        'goodbye cruel Alan! Goodbye cruel Alan! GOODBYE cruel Alan! '
      );
  });

  it('multiple blocks with complex lookup', function() {
    var string = '{{#goodbyes}}{{../name}}{{../name}}{{/goodbyes}}';
    var hash = {
      name: 'Alan',
      goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }]
    };

    expectTemplate(string)
      .withInput(hash)
      .toCompileTo('AlanAlanAlanAlanAlanAlan');
  });

  it('block with complex lookup using nested context', function() {
    var string = '{{#goodbyes}}{{text}} cruel {{foo/../name}}! {{/goodbyes}}';

    expectTemplate(string).toThrow(Error);
  });

  it('block with deep nested complex lookup', function() {
    var string =
      '{{#outer}}Goodbye {{#inner}}cruel {{../sibling}} {{../../omg}}{{/inner}}{{/outer}}';
    var hash = {
      omg: 'OMG!',
      outer: [{ sibling: 'sad', inner: [{ text: 'goodbye' }] }]
    };

    expectTemplate(string)
      .withInput(hash)
      .toCompileTo('Goodbye cruel sad OMG!');
  });

  it('works with cached blocks', function() {
    var string =
      '{{#each person}}{{#with .}}{{first}} {{last}}{{/with}}{{/each}}';
    var compileOptions = { data: false };

    var input = {
      person: [
        { first: 'Alan', last: 'Johnson' },
        { first: 'Alan', last: 'Johnson' }
      ]
    };
    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withInput(input)
      .toCompileTo('Alan JohnsonAlan Johnson');
  });

  describe('inverted sections', function() {
    it('inverted sections with unset value', function() {
      var string =
        '{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}';
      var hash = {};
      expectTemplate(string)
        .withInput(hash)
        .withMessage("Inverted section rendered when value isn't set.")
        .toCompileTo('Right On!');
    });

    it('inverted section with false value', function() {
      var string =
        '{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}';
      var hash = { goodbyes: false };
      expectTemplate(string)
        .withInput(hash)
        .withMessage('Inverted section rendered when value is false.')
        .toCompileTo('Right On!');
    });

    it('inverted section with empty set', function() {
      var string =
        '{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}';
      var hash = { goodbyes: [] };
      expectTemplate(string)
        .withInput(hash)
        .withMessage('Inverted section rendered when value is empty set.')
        .toCompileTo('Right On!');
    });

    it('block inverted sections', function() {
      expectTemplate('{{#people}}{{name}}{{^}}{{none}}{{/people}}')
        .withInput({ none: 'No people' })
        .toCompileTo('No people');
    });
    it('chained inverted sections', function() {
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
    it('chained inverted sections with mismatch', function() {
      expectTemplate(
        '{{#people}}{{name}}{{else if none}}{{none}}{{/if}}'
      ).toThrow(Error);
    });

    it('block inverted sections with empty arrays', function() {
      expectTemplate('{{#people}}{{name}}{{^}}{{none}}{{/people}}')
        .withInput({
          none: 'No people',
          people: []
        })
        .toCompileTo('No people');
    });
  });

  describe('standalone sections', function() {
    it('block standalone else sections', function() {
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
    it('block standalone else sections can be disabled', function() {
      expectTemplate('{{#people}}\n{{name}}\n{{^}}\n{{none}}\n{{/people}}\n')
        .withInput({ none: 'No people' })
        .withCompileOptions({ ignoreStandalone: true })
        .toCompileTo('\nNo people\n\n');
      expectTemplate('{{#none}}\n{{.}}\n{{^}}\nFail\n{{/none}}\n')
        .withInput({ none: 'No people' })
        .withCompileOptions({ ignoreStandalone: true })
        .toCompileTo('\nNo people\n\n');
    });
    it('block standalone chained else sections', function() {
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
    it('should handle nesting', function() {
      expectTemplate('{{#data}}\n{{#if true}}\n{{.}}\n{{/if}}\n{{/data}}\nOK.')
        .withInput({
          data: [1, 3, 5]
        })
        .toCompileTo('1\n3\n5\nOK.');
    });
  });

  describe('compat mode', function() {
    it('block with deep recursive lookup lookup', function() {
      var string =
        '{{#outer}}Goodbye {{#inner}}cruel {{omg}}{{/inner}}{{/outer}}';
      var hash = { omg: 'OMG!', outer: [{ inner: [{ text: 'goodbye' }] }] };

      expectTemplate(string)
        .withInput(hash)
        .withCompileOptions({ compat: true })
        .toCompileTo('Goodbye cruel OMG!');
    });

    it('block with deep recursive pathed lookup', function() {
      var string =
        '{{#outer}}Goodbye {{#inner}}cruel {{omg.yes}}{{/inner}}{{/outer}}';
      var hash = {
        omg: { yes: 'OMG!' },
        outer: [{ inner: [{ yes: 'no', text: 'goodbye' }] }]
      };

      expectTemplate(string)
        .withInput(hash)
        .withCompileOptions({ compat: true })
        .toCompileTo('Goodbye cruel OMG!');
    });
    it('block with missed recursive lookup', function() {
      var string =
        '{{#outer}}Goodbye {{#inner}}cruel {{omg.yes}}{{/inner}}{{/outer}}';
      var hash = {
        omg: { no: 'OMG!' },
        outer: [{ inner: [{ yes: 'no', text: 'goodbye' }] }]
      };

      expectTemplate(string)
        .withInput(hash)
        .withCompileOptions({ compat: true })
        .toCompileTo('Goodbye cruel ');
    });
  });

  describe('decorators', function() {
    it('should apply mustache decorators', function() {
      var helpers = {
        helper: function(options) {
          return options.fn.run;
        }
      };
      var decorators = {
        decorator: function(fn) {
          fn.run = 'success';
          return fn;
        }
      };
      expectTemplate('{{#helper}}{{*decorator}}{{/helper}}')
        .withHelpers(helpers)
        .withDecorators(decorators)
        .toCompileTo('success');
    });
    it('should apply allow undefined return', function() {
      var helpers = {
        helper: function(options) {
          return options.fn() + options.fn.run;
        }
      };
      var decorators = {
        decorator: function(fn) {
          fn.run = 'cess';
        }
      };
      expectTemplate('{{#helper}}{{*decorator}}suc{{/helper}}')
        .withHelpers(helpers)
        .withDecorators(decorators)
        .toCompileTo('success');
    });

    it('should apply block decorators', function() {
      var helpers = {
        helper: function(options) {
          return options.fn.run;
        }
      };
      var decorators = {
        decorator: function(fn, props, container, options) {
          fn.run = options.fn();
          return fn;
        }
      };
      expectTemplate(
        '{{#helper}}{{#*decorator}}success{{/decorator}}{{/helper}}'
      )
        .withHelpers(helpers)
        .withDecorators(decorators)
        .toCompileTo('success');
    });
    it('should support nested decorators', function() {
      var helpers = {
        helper: function(options) {
          return options.fn.run;
        }
      };
      var decorators = {
        decorator: function(fn, props, container, options) {
          fn.run = options.fn.nested + options.fn();
          return fn;
        },
        nested: function(fn, props, container, options) {
          props.nested = options.fn();
        }
      };
      expectTemplate(
        '{{#helper}}{{#*decorator}}{{#*nested}}suc{{/nested}}cess{{/decorator}}{{/helper}}'
      )
        .withHelpers(helpers)
        .withDecorators(decorators)
        .toCompileTo('success');
    });

    it('should apply multiple decorators', function() {
      var helpers = {
        helper: function(options) {
          return options.fn.run;
        }
      };
      var decorators = {
        decorator: function(fn, props, container, options) {
          fn.run = (fn.run || '') + options.fn();
          return fn;
        }
      };
      expectTemplate(
        '{{#helper}}{{#*decorator}}suc{{/decorator}}{{#*decorator}}cess{{/decorator}}{{/helper}}'
      )
        .withHelpers(helpers)
        .withDecorators(decorators)
        .toCompileTo('success');
    });

    it('should access parent variables', function() {
      var helpers = {
        helper: function(options) {
          return options.fn.run;
        }
      };
      var decorators = {
        decorator: function(fn, props, container, options) {
          fn.run = options.args;
          return fn;
        }
      };
      expectTemplate('{{#helper}}{{*decorator foo}}{{/helper}}')
        .withHelpers(helpers)
        .withDecorators(decorators)
        .withInput({ foo: 'success' })
        .toCompileTo('success');
    });
    it('should work with root program', function() {
      var run;
      var decorators = {
        decorator: function(fn, props, container, options) {
          equals(options.args[0], 'success');
          run = true;
          return fn;
        }
      };
      expectTemplate('{{*decorator "success"}}')
        .withDecorators(decorators)
        .withInput({ foo: 'success' })
        .toCompileTo('');
      equals(run, true);
    });
    it('should fail when accessing variables from root', function() {
      var run;
      var decorators = {
        decorator: function(fn, props, container, options) {
          equals(options.args[0], undefined);
          run = true;
          return fn;
        }
      };
      expectTemplate('{{*decorator foo}}')
        .withDecorators(decorators)
        .withInput({ foo: 'fail' })
        .toCompileTo('');
      equals(run, true);
    });

    describe('registration', function() {
      it('unregisters', function() {
        handlebarsEnv.decorators = {};

        handlebarsEnv.registerDecorator('foo', function() {
          return 'fail';
        });

        equals(!!handlebarsEnv.decorators.foo, true);
        handlebarsEnv.unregisterDecorator('foo');
        equals(handlebarsEnv.decorators.foo, undefined);
      });

      it('allows multiple globals', function() {
        handlebarsEnv.decorators = {};

        handlebarsEnv.registerDecorator({
          foo: function() {},
          bar: function() {}
        });

        equals(!!handlebarsEnv.decorators.foo, true);
        equals(!!handlebarsEnv.decorators.bar, true);
        handlebarsEnv.unregisterDecorator('foo');
        handlebarsEnv.unregisterDecorator('bar');
        equals(handlebarsEnv.decorators.foo, undefined);
        equals(handlebarsEnv.decorators.bar, undefined);
      });
      it('fails with multiple and args', function() {
        shouldThrow(
          function() {
            handlebarsEnv.registerDecorator(
              {
                world: function() {
                  return 'world!';
                },
                testHelper: function() {
                  return 'found it!';
                }
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
