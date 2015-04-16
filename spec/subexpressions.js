describe('subexpressions', function() {
  it('arg-less helper', function() {
    var string = '{{foo (bar)}}!';
    var context = {};
    var helpers = {
      foo: function(val) {
        return val + val;
      },
      bar: function() {
        return 'LOL';
      }
    };
    shouldCompileTo(string, [context, helpers], 'LOLLOL!');
  });

  it('helper w args', function() {
    var string = '{{blog (equal a b)}}';

    var context = { bar: 'LOL' };
    var helpers = {
      blog: function(val) {
        return 'val is ' + val;
      },
      equal: function(x, y) {
        return x === y;
      }
    };
    shouldCompileTo(string, [context, helpers], 'val is true');
  });

  it('mixed paths and helpers', function() {
    var string = '{{blog baz.bat (equal a b) baz.bar}}';

    var context = { bar: 'LOL', baz: {bat: 'foo!', bar: 'bar!'} };
    var helpers = {
      blog: function(val, that, theOther) {
        return 'val is ' + val + ', ' + that + ' and ' + theOther;
      },
      equal: function(x, y) {
        return x === y;
      }
    };
    shouldCompileTo(string, [context, helpers], 'val is foo!, true and bar!');
  });

  it('supports much nesting', function() {
    var string = '{{blog (equal (equal true true) true)}}';

    var context = { bar: 'LOL' };
    var helpers = {
      blog: function(val) {
        return 'val is ' + val;
      },
      equal: function(x, y) {
        return x === y;
      }
    };
    shouldCompileTo(string, [context, helpers], 'val is true');
  });

  it('GH-800 : Complex subexpressions', function() {
    var context = {a: 'a', b: 'b', c: {c: 'c'}, d: 'd', e: {e: 'e'}};
    var helpers = {
      dash: function(a, b) {
        return a + '-' + b;
      },
      concat: function(a, b) {
        return a + b;
      }
    };

    shouldCompileTo("{{dash 'abc' (concat a b)}}", [context, helpers], 'abc-ab');
    shouldCompileTo('{{dash d (concat a b)}}', [context, helpers], 'd-ab');
    shouldCompileTo('{{dash c.c (concat a b)}}', [context, helpers], 'c-ab');
    shouldCompileTo('{{dash (concat a b) c.c}}', [context, helpers], 'ab-c');
    shouldCompileTo('{{dash (concat a e.e) c.c}}', [context, helpers], 'ae-c');
  });

  it('provides each nested helper invocation its own options hash', function() {
    var string = '{{equal (equal true true) true}}';

    var lastOptions = null;
    var helpers = {
      equal: function(x, y, options) {
        if (!options || options === lastOptions) {
          throw new Error('options hash was reused');
        }
        lastOptions = options;
        return x === y;
      }
    };
    shouldCompileTo(string, [{}, helpers], 'true');
  });

  it('with hashes', function() {
    var string = "{{blog (equal (equal true true) true fun='yes')}}";

    var context = { bar: 'LOL' };
    var helpers = {
      blog: function(val) {
        return 'val is ' + val;
      },
      equal: function(x, y) {
        return x === y;
      }
    };
    shouldCompileTo(string, [context, helpers], 'val is true');
  });

  it('as hashes', function() {
    var string = "{{blog fun=(equal (blog fun=1) 'val is 1')}}";

    var helpers = {
      blog: function(options) {
        return 'val is ' + options.hash.fun;
      },
      equal: function(x, y) {
        return x === y;
      }
    };
    shouldCompileTo(string, [{}, helpers], 'val is true');
  });

  it('multiple subexpressions in a hash', function() {
    var string = '{{input aria-label=(t "Name") placeholder=(t "Example User")}}';

    var helpers = {
      input: function(options) {
        var hash = options.hash;
        var ariaLabel = Handlebars.Utils.escapeExpression(hash['aria-label']);
        var placeholder = Handlebars.Utils.escapeExpression(hash.placeholder);
        return new Handlebars.SafeString('<input aria-label="' + ariaLabel + '" placeholder="' + placeholder + '" />');
      },
      t: function(defaultString) {
        return new Handlebars.SafeString(defaultString);
      }
    };
    shouldCompileTo(string, [{}, helpers], '<input aria-label="Name" placeholder="Example User" />');
  });

  it('multiple subexpressions in a hash with context', function() {
    var string = '{{input aria-label=(t item.field) placeholder=(t item.placeholder)}}';

    var context = {
      item: {
        field: 'Name',
        placeholder: 'Example User'
      }
    };

    var helpers = {
      input: function(options) {
        var hash = options.hash;
        var ariaLabel = Handlebars.Utils.escapeExpression(hash['aria-label']);
        var placeholder = Handlebars.Utils.escapeExpression(hash.placeholder);
        return new Handlebars.SafeString('<input aria-label="' + ariaLabel + '" placeholder="' + placeholder + '" />');
      },
      t: function(defaultString) {
        return new Handlebars.SafeString(defaultString);
      }
    };
    shouldCompileTo(string, [context, helpers], '<input aria-label="Name" placeholder="Example User" />');
  });

  it('in string params mode,', function() {
    var template = CompilerContext.compile('{{snog (blorg foo x=y) yeah a=b}}', {stringParams: true});

    var helpers = {
      snog: function(a, b, options) {
        equals(a, 'foo');
        equals(options.types.length, 2, 'string params for outer helper processed correctly');
        equals(options.types[0], 'SubExpression', 'string params for outer helper processed correctly');
        equals(options.types[1], 'PathExpression', 'string params for outer helper processed correctly');
        return a + b;
      },

      blorg: function(a, options) {
        equals(options.types.length, 1, 'string params for inner helper processed correctly');
        equals(options.types[0], 'PathExpression', 'string params for inner helper processed correctly');
        return a;
      }
    };

    var result = template({
      foo: {},
      yeah: {}
    }, {helpers: helpers});

    equals(result, 'fooyeah');
  });

  it('as hashes in string params mode', function() {
    var template = CompilerContext.compile('{{blog fun=(bork)}}', {stringParams: true});

    var helpers = {
      blog: function(options) {
        equals(options.hashTypes.fun, 'SubExpression');
        return 'val is ' + options.hash.fun;
      },
      bork: function() {
        return 'BORK';
      }
    };

    var result = template({}, {helpers: helpers});
    equals(result, 'val is BORK');
  });

  it('subexpression functions on the context', function() {
    var string = '{{foo (bar)}}!';
    var context = {
      bar: function() {
        return 'LOL';
      }
    };
    var helpers = {
      foo: function(val) {
        return val + val;
      }
    };
    shouldCompileTo(string, [context, helpers], 'LOLLOL!');
  });

  it("subexpressions can't just be property lookups", function() {
    var string = '{{foo (bar)}}!';
    var context = {
      bar: 'LOL'
    };
    var helpers = {
      foo: function(val) {
        return val + val;
      }
    };
    shouldThrow(function() {
      shouldCompileTo(string, [context, helpers], 'LOLLOL!');
    });
  });
});
