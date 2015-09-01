describe('blocks', function() {
  it('array', function() {
    var string = '{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!';
    var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};
    shouldCompileTo(string, hash, 'goodbye! Goodbye! GOODBYE! cruel world!',
                    'Arrays iterate over the contents when not empty');

    shouldCompileTo(string, {goodbyes: [], world: 'world'}, 'cruel world!',
                    'Arrays ignore the contents when empty');
  });

  it('array without data', function() {
    var string = '{{#goodbyes}}{{text}}{{/goodbyes}} {{#goodbyes}}{{text}}{{/goodbyes}}';
    var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};
    shouldCompileTo(string, [hash,,, false], 'goodbyeGoodbyeGOODBYE goodbyeGoodbyeGOODBYE');
  });

  it('array with @index', function() {
    var string = '{{#goodbyes}}{{@index}}. {{text}}! {{/goodbyes}}cruel {{world}}!';
    var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};

    var template = CompilerContext.compile(string);
    var result = template(hash);

    equal(result, '0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!', 'The @index variable is used');
  });

  it('empty block', function() {
    var string = '{{#goodbyes}}{{/goodbyes}}cruel {{world}}!';
    var hash = {goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}], world: 'world'};
    shouldCompileTo(string, hash, 'cruel world!',
                    'Arrays iterate over the contents when not empty');

    shouldCompileTo(string, {goodbyes: [], world: 'world'}, 'cruel world!',
                    'Arrays ignore the contents when empty');
  });

  it('block with complex lookup', function() {
    var string = '{{#goodbyes}}{{text}} cruel {{../name}}! {{/goodbyes}}';
    var hash = {name: 'Alan', goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}]};

    shouldCompileTo(string, hash, 'goodbye cruel Alan! Goodbye cruel Alan! GOODBYE cruel Alan! ',
                    'Templates can access variables in contexts up the stack with relative path syntax');
  });

  it('multiple blocks with complex lookup', function() {
    var string = '{{#goodbyes}}{{../name}}{{../name}}{{/goodbyes}}';
    var hash = {name: 'Alan', goodbyes: [{text: 'goodbye'}, {text: 'Goodbye'}, {text: 'GOODBYE'}]};

    shouldCompileTo(string, hash, 'AlanAlanAlanAlanAlanAlan');
  });

  it('block with complex lookup using nested context', function() {
    var string = '{{#goodbyes}}{{text}} cruel {{foo/../name}}! {{/goodbyes}}';

    shouldThrow(function() {
      CompilerContext.compile(string);
    }, Error);
  });

  it('block with deep nested complex lookup', function() {
    var string = '{{#outer}}Goodbye {{#inner}}cruel {{../sibling}} {{../../omg}}{{/inner}}{{/outer}}';
    var hash = {omg: 'OMG!', outer: [{ sibling: 'sad', inner: [{ text: 'goodbye' }] }] };

    shouldCompileTo(string, hash, 'Goodbye cruel sad OMG!');
  });

  it('works with cached blocks', function() {
    var template = CompilerContext.compile('{{#each person}}{{#with .}}{{first}} {{last}}{{/with}}{{/each}}', {data: false});

    var result = template({person: [{first: 'Alan', last: 'Johnson'}, {first: 'Alan', last: 'Johnson'}]});
    equals(result, 'Alan JohnsonAlan Johnson');
  });

  describe('inverted sections', function() {
    it('inverted sections with unset value', function() {
      var string = '{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}';
      var hash = {};
      shouldCompileTo(string, hash, 'Right On!', "Inverted section rendered when value isn't set.");
    });

    it('inverted section with false value', function() {
      var string = '{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}';
      var hash = {goodbyes: false};
      shouldCompileTo(string, hash, 'Right On!', 'Inverted section rendered when value is false.');
    });

    it('inverted section with empty set', function() {
      var string = '{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}';
      var hash = {goodbyes: []};
      shouldCompileTo(string, hash, 'Right On!', 'Inverted section rendered when value is empty set.');
    });

    it('block inverted sections', function() {
      shouldCompileTo('{{#people}}{{name}}{{^}}{{none}}{{/people}}', {none: 'No people'},
        'No people');
    });
    it('chained inverted sections', function() {
      shouldCompileTo('{{#people}}{{name}}{{else if none}}{{none}}{{/people}}', {none: 'No people'},
        'No people');
      shouldCompileTo('{{#people}}{{name}}{{else if nothere}}fail{{else unless nothere}}{{none}}{{/people}}', {none: 'No people'},
        'No people');
      shouldCompileTo('{{#people}}{{name}}{{else if none}}{{none}}{{else}}fail{{/people}}', {none: 'No people'},
        'No people');
    });
    it('chained inverted sections with mismatch', function() {
      shouldThrow(function() {
        shouldCompileTo('{{#people}}{{name}}{{else if none}}{{none}}{{/if}}', {none: 'No people'},
          'No people');
      }, Error);
    });

    it('block inverted sections with empty arrays', function() {
      shouldCompileTo('{{#people}}{{name}}{{^}}{{none}}{{/people}}', {none: 'No people', people: []},
        'No people');
    });
  });

  describe('standalone sections', function() {
    it('block standalone else sections', function() {
      shouldCompileTo('{{#people}}\n{{name}}\n{{^}}\n{{none}}\n{{/people}}\n', {none: 'No people'},
        'No people\n');
      shouldCompileTo('{{#none}}\n{{.}}\n{{^}}\n{{none}}\n{{/none}}\n', {none: 'No people'},
        'No people\n');
      shouldCompileTo('{{#people}}\n{{name}}\n{{^}}\n{{none}}\n{{/people}}\n', {none: 'No people'},
        'No people\n');
    });
    it('block standalone else sections can be disabled', function() {
      shouldCompileTo(
        '{{#people}}\n{{name}}\n{{^}}\n{{none}}\n{{/people}}\n',
        [{none: 'No people'}, {}, {}, {ignoreStandalone: true}],
        '\nNo people\n\n');
      shouldCompileTo(
        '{{#none}}\n{{.}}\n{{^}}\nFail\n{{/none}}\n',
        [{none: 'No people'}, {}, {}, {ignoreStandalone: true}],
        '\nNo people\n\n');
    });
    it('block standalone chained else sections', function() {
      shouldCompileTo('{{#people}}\n{{name}}\n{{else if none}}\n{{none}}\n{{/people}}\n', {none: 'No people'},
        'No people\n');
      shouldCompileTo('{{#people}}\n{{name}}\n{{else if none}}\n{{none}}\n{{^}}\n{{/people}}\n', {none: 'No people'},
        'No people\n');
    });
    it('should handle nesting', function() {
      shouldCompileTo('{{#data}}\n{{#if true}}\n{{.}}\n{{/if}}\n{{/data}}\nOK.', {data: [1, 3, 5]}, '1\n3\n5\nOK.');
    });
  });

  describe('compat mode', function() {
    it('block with deep recursive lookup lookup', function() {
      var string = '{{#outer}}Goodbye {{#inner}}cruel {{omg}}{{/inner}}{{/outer}}';
      var hash = {omg: 'OMG!', outer: [{ inner: [{ text: 'goodbye' }] }] };

      shouldCompileTo(string, [hash, undefined, undefined, true], 'Goodbye cruel OMG!');
    });
    it('block with deep recursive pathed lookup', function() {
      var string = '{{#outer}}Goodbye {{#inner}}cruel {{omg.yes}}{{/inner}}{{/outer}}';
      var hash = {omg: {yes: 'OMG!'}, outer: [{ inner: [{ yes: 'no', text: 'goodbye' }] }] };

      shouldCompileTo(string, [hash, undefined, undefined, true], 'Goodbye cruel OMG!');
    });
    it('block with missed recursive lookup', function() {
      var string = '{{#outer}}Goodbye {{#inner}}cruel {{omg.yes}}{{/inner}}{{/outer}}';
      var hash = {omg: {no: 'OMG!'}, outer: [{ inner: [{ yes: 'no', text: 'goodbye' }] }] };

      shouldCompileTo(string, [hash, undefined, undefined, true], 'Goodbye cruel ');
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
      shouldCompileTo(
          '{{#helper}}{{*decorator}}{{/helper}}',
          {hash: {}, helpers: helpers, decorators: decorators},
          'success');
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
      shouldCompileTo(
          '{{#helper}}{{*decorator}}suc{{/helper}}',
          {hash: {}, helpers: helpers, decorators: decorators},
          'success');
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
      shouldCompileTo(
          '{{#helper}}{{#*decorator}}success{{/decorator}}{{/helper}}',
          {hash: {}, helpers: helpers, decorators: decorators},
          'success');
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
      shouldCompileTo(
          '{{#helper}}{{#*decorator}}{{#*nested}}suc{{/nested}}cess{{/decorator}}{{/helper}}',
          {hash: {}, helpers: helpers, decorators: decorators},
          'success');
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
      shouldCompileTo(
          '{{#helper}}{{#*decorator}}suc{{/decorator}}{{#*decorator}}cess{{/decorator}}{{/helper}}',
          {hash: {}, helpers: helpers, decorators: decorators},
          'success');
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
      shouldCompileTo(
          '{{#helper}}{{*decorator foo}}{{/helper}}',
          {hash: {'foo': 'success'}, helpers: helpers, decorators: decorators},
          'success');
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
      shouldCompileTo(
          '{{*decorator "success"}}',
          {hash: {'foo': 'success'}, decorators: decorators},
          '');
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
      shouldCompileTo(
          '{{*decorator foo}}',
          {hash: {'foo': 'fail'}, decorators: decorators},
          '');
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
        shouldThrow(function() {
          handlebarsEnv.registerDecorator({
            world: function() { return 'world!'; },
            testHelper: function() { return 'found it!'; }
          }, {});
        }, Error, 'Arg not supported with multiple decorators');
      });
    });
  });
});
