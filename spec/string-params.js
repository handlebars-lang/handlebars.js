describe('string params mode', function() {
  it("arguments to helpers can be retrieved from options hash in string form", function() {
    var template = CompilerContext.compile('{{wycats is.a slave.driver}}', {stringParams: true});

    var helpers = {
      wycats: function(passiveVoice, noun) {
        return "HELP ME MY BOSS " + passiveVoice + ' ' + noun;
      }
    };

    var result = template({}, {helpers: helpers});

    equals(result, "HELP ME MY BOSS is.a slave.driver", "String parameters output");
  });

  it("when using block form, arguments to helpers can be retrieved from options hash in string form", function() {
    var template = CompilerContext.compile('{{#wycats is.a slave.driver}}help :({{/wycats}}', {stringParams: true});

    var helpers = {
      wycats: function(passiveVoice, noun, options) {
        return "HELP ME MY BOSS " + passiveVoice + ' ' +
                noun + ': ' + options.fn(this);
      }
    };

    var result = template({}, {helpers: helpers});

    equals(result, "HELP ME MY BOSS is.a slave.driver: help :(", "String parameters output");
  });

  it("when inside a block in String mode, .. passes the appropriate context in the options hash", function() {
    var template = CompilerContext.compile('{{#with dale}}{{tomdale ../need dad.joke}}{{/with}}', {stringParams: true});

    var helpers = {
      tomdale: function(desire, noun, options) {
        return "STOP ME FROM READING HACKER NEWS I " +
                options.contexts[0][desire] + " " + noun;
      },

      "with": function(context, options) {
        return options.fn(options.contexts[0][context]);
      }
    };

    var result = template({
      dale: {},

      need: 'need-a'
    }, {helpers: helpers});

    equals(result, "STOP ME FROM READING HACKER NEWS I need-a dad.joke", "Proper context variable output");
  });

  it("information about the types is passed along", function() {
    var template = CompilerContext.compile('{{tomdale "need" dad.joke true false}}', { stringParams: true });

    var helpers = {
      tomdale: function(desire, noun, trueBool, falseBool, options) {
        equal(options.types[0], 'STRING', "the string type is passed");
        equal(options.types[1], 'ID', "the expression type is passed");
        equal(options.types[2], 'BOOLEAN', "the expression type is passed");
        equal(desire, "need", "the string form is passed for strings");
        equal(noun, "dad.joke", "the string form is passed for expressions");
        equal(trueBool, true, "raw booleans are passed through");
        equal(falseBool, false, "raw booleans are passed through");
        return "Helper called";
      }
    };

    var result = template({}, { helpers: helpers });
    equal(result, "Helper called");
  });

  it("hash parameters get type information", function() {
    var template = CompilerContext.compile('{{tomdale he.says desire="need" noun=dad.joke bool=true}}', { stringParams: true });

    var helpers = {
      tomdale: function(exclamation, options) {
        equal(exclamation, "he.says");
        equal(options.types[0], "ID");

        equal(options.hashTypes.desire, "STRING");
        equal(options.hashTypes.noun, "ID");
        equal(options.hashTypes.bool, "BOOLEAN");
        equal(options.hash.desire, "need");
        equal(options.hash.noun, "dad.joke");
        equal(options.hash.bool, true);
        return "Helper called";
      }
    };

    var result = template({}, { helpers: helpers });
    equal(result, "Helper called");
  });

  it("hash parameters get context information", function() {
    var template = CompilerContext.compile('{{#with dale}}{{tomdale he.says desire="need" noun=../dad/joke bool=true}}{{/with}}', { stringParams: true });

    var context = {dale: {}};

    var helpers = {
      tomdale: function(exclamation, options) {
        equal(exclamation, "he.says");
        equal(options.types[0], "ID");

        equal(options.contexts.length, 1);
        equal(options.hashContexts.noun, context);
        equal(options.hash.desire, "need");
        equal(options.hash.noun, "dad.joke");
        equal(options.hash.bool, true);
        return "Helper called";
      },
      "with": function(context, options) {
        return options.fn(options.contexts[0][context]);
      }
    };

    var result = template(context, { helpers: helpers });
    equal(result, "Helper called");
  });

  it("when inside a block in String mode, .. passes the appropriate context in the options hash to a block helper", function() {
    var template = CompilerContext.compile('{{#with dale}}{{#tomdale ../need dad.joke}}wot{{/tomdale}}{{/with}}', {stringParams: true});

    var helpers = {
      tomdale: function(desire, noun, options) {
        return "STOP ME FROM READING HACKER NEWS I " +
                options.contexts[0][desire] + " " + noun + " " +
                options.fn(this);
      },

      "with": function(context, options) {
        return options.fn(options.contexts[0][context]);
      }
    };

    var result = template({
      dale: {},

      need: 'need-a'
    }, {helpers: helpers});

    equals(result, "STOP ME FROM READING HACKER NEWS I need-a dad.joke wot", "Proper context variable output");
  });

  it("with nested block ambiguous", function() {
    var template = CompilerContext.compile('{{#with content}}{{#view}}{{firstName}} {{lastName}}{{/view}}{{/with}}', {stringParams: true});

    var helpers  = {
      with: function(options) {
        return "WITH";
      },
      view: function() {
        return "VIEW";
      }
    };

    var result = template({}, {helpers: helpers});
    equals(result, "WITH");
  });
});
