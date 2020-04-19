describe('string params mode', function() {
  it('arguments to helpers can be retrieved from options hash in string form', function() {
    var string = '{{wycats is.a slave.driver}}';
    var compileOptions = {
      stringParams: true
    };

    var helpers = {
      wycats: function(passiveVoice, noun) {
        return 'HELP ME MY BOSS ' + passiveVoice + ' ' + noun;
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withMessage('String parameters output')
      .toCompileTo('HELP ME MY BOSS is.a slave.driver');
  });

  it('when using block form, arguments to helpers can be retrieved from options hash in string form', function() {
    var string = '{{#wycats is.a slave.driver}}help :({{/wycats}}';
    var compileOptions = { stringParams: true };

    var helpers = {
      wycats: function(passiveVoice, noun, options) {
        return (
          'HELP ME MY BOSS ' +
          passiveVoice +
          ' ' +
          noun +
          ': ' +
          options.fn(this)
        );
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withMessage('String parameters output')
      .toCompileTo('HELP ME MY BOSS is.a slave.driver: help :(');
  });

  it('when inside a block in String mode, .. passes the appropriate context in the options hash', function() {
    var string = '{{#with dale}}{{tomdale ../need dad.joke}}{{/with}}';
    var compileOptions = { stringParams: true };

    var helpers = {
      tomdale: function(desire, noun, options) {
        return (
          'STOP ME FROM READING HACKER NEWS I ' +
          options.contexts[0][desire] +
          ' ' +
          noun
        );
      },

      with: function(context, options) {
        return options.fn(options.contexts[0][context]);
      }
    };

    var input = {
      dale: {},

      need: 'need-a'
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(input)
      .withMessage('Proper context variable output')
      .toCompileTo('STOP ME FROM READING HACKER NEWS I need-a dad.joke');
  });

  it('information about the types is passed along', function() {
    var string = "{{tomdale 'need' dad.joke true false}}";
    var compileOptions = { stringParams: true };

    var helpers = {
      tomdale: function(desire, noun, trueBool, falseBool, options) {
        equal(options.types[0], 'StringLiteral', 'the string type is passed');
        equal(
          options.types[1],
          'PathExpression',
          'the expression type is passed'
        );
        equal(
          options.types[2],
          'BooleanLiteral',
          'the expression type is passed'
        );
        equal(desire, 'need', 'the string form is passed for strings');
        equal(noun, 'dad.joke', 'the string form is passed for expressions');
        equal(trueBool, true, 'raw booleans are passed through');
        equal(falseBool, false, 'raw booleans are passed through');
        return 'Helper called';
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .toCompileTo('Helper called');
  });

  it('hash parameters get type information', function() {
    var string = "{{tomdale he.says desire='need' noun=dad.joke bool=true}}";
    var compileOptions = { stringParams: true };

    var helpers = {
      tomdale: function(exclamation, options) {
        equal(exclamation, 'he.says');
        equal(options.types[0], 'PathExpression');

        equal(options.hashTypes.desire, 'StringLiteral');
        equal(options.hashTypes.noun, 'PathExpression');
        equal(options.hashTypes.bool, 'BooleanLiteral');
        equal(options.hash.desire, 'need');
        equal(options.hash.noun, 'dad.joke');
        equal(options.hash.bool, true);
        return 'Helper called';
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .toCompileTo('Helper called');
  });

  it('hash parameters get context information', function() {
    var string =
      "{{#with dale}}{{tomdale he.says desire='need' noun=../dad/joke bool=true}}{{/with}}";
    var compileOptions = { stringParams: true };

    var context = { dale: {} };

    var helpers = {
      tomdale: function(exclamation, options) {
        equal(exclamation, 'he.says');
        equal(options.types[0], 'PathExpression');

        equal(options.contexts.length, 1);
        equal(options.hashContexts.noun, context);
        equal(options.hash.desire, 'need');
        equal(options.hash.noun, 'dad.joke');
        equal(options.hash.bool, true);
        return 'Helper called';
      },
      with: function(withContext, options) {
        return options.fn(options.contexts[0][withContext]);
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(context)
      .toCompileTo('Helper called');
  });

  it('when inside a block in String mode, .. passes the appropriate context in the options hash to a block helper', function() {
    var string =
      '{{#with dale}}{{#tomdale ../need dad.joke}}wot{{/tomdale}}{{/with}}';
    var compileOptions = { stringParams: true };

    var helpers = {
      tomdale: function(desire, noun, options) {
        return (
          'STOP ME FROM READING HACKER NEWS I ' +
          options.contexts[0][desire] +
          ' ' +
          noun +
          ' ' +
          options.fn(this)
        );
      },

      with: function(context, options) {
        return options.fn(options.contexts[0][context]);
      }
    };

    var input = {
      dale: {},

      need: 'need-a'
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .withInput(input)
      .withMessage('Proper context variable output')
      .toCompileTo('STOP ME FROM READING HACKER NEWS I need-a dad.joke wot');
  });

  it('with nested block ambiguous', function() {
    var string =
      '{{#with content}}{{#view}}{{firstName}} {{lastName}}{{/view}}{{/with}}';
    var compileOptions = { stringParams: true };

    var helpers = {
      with: function() {
        return 'WITH';
      },
      view: function() {
        return 'VIEW';
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .toCompileTo('WITH');
  });

  it('should handle DATA', function() {
    var string = '{{foo @bar}}';
    var compileOptions = { stringParams: true };

    var helpers = {
      foo: function(bar, options) {
        equal(bar, '@bar');
        equal(options.types[0], 'PathExpression');
        return 'Foo!';
      }
    };

    expectTemplate(string)
      .withCompileOptions(compileOptions)
      .withHelpers(helpers)
      .toCompileTo('Foo!');
  });
});
