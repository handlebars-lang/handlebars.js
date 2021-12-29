describe('subexpressions', function() {
  it('arg-less helper', function() {
    expectTemplate('{{foo (bar)}}!')
      .withHelpers({
        foo: function(val) {
          return val + val;
        },
        bar: function() {
          return 'LOL';
        }
      })
      .toCompileTo('LOLLOL!');
  });

  it('helper w args', function() {
    expectTemplate('{{blog (equal a b)}}')
      .withInput({ bar: 'LOL' })
      .withHelpers({
        blog: function(val) {
          return 'val is ' + val;
        },
        equal: function(x, y) {
          return x === y;
        }
      })
      .toCompileTo('val is true');
  });

  it('mixed paths and helpers', function() {
    expectTemplate('{{blog baz.bat (equal a b) baz.bar}}')
      .withInput({ bar: 'LOL', baz: { bat: 'foo!', bar: 'bar!' } })
      .withHelpers({
        blog: function(val, that, theOther) {
          return 'val is ' + val + ', ' + that + ' and ' + theOther;
        },
        equal: function(x, y) {
          return x === y;
        }
      })
      .toCompileTo('val is foo!, true and bar!');
  });

  it('supports much nesting', function() {
    expectTemplate('{{blog (equal (equal true true) true)}}')
      .withInput({ bar: 'LOL' })
      .withHelpers({
        blog: function(val) {
          return 'val is ' + val;
        },
        equal: function(x, y) {
          return x === y;
        }
      })
      .toCompileTo('val is true');
  });

  it('GH-800 : Complex subexpressions', function() {
    var context = { a: 'a', b: 'b', c: { c: 'c' }, d: 'd', e: { e: 'e' } };
    var helpers = {
      dash: function(a, b) {
        return a + '-' + b;
      },
      concat: function(a, b) {
        return a + b;
      }
    };

    expectTemplate("{{dash 'abc' (concat a b)}}")
      .withInput(context)
      .withHelpers(helpers)
      .toCompileTo('abc-ab');

    expectTemplate('{{dash d (concat a b)}}')
      .withInput(context)
      .withHelpers(helpers)
      .toCompileTo('d-ab');

    expectTemplate('{{dash c.c (concat a b)}}')
      .withInput(context)
      .withHelpers(helpers)
      .toCompileTo('c-ab');

    expectTemplate('{{dash (concat a b) c.c}}')
      .withInput(context)
      .withHelpers(helpers)
      .toCompileTo('ab-c');

    expectTemplate('{{dash (concat a e.e) c.c}}')
      .withInput(context)
      .withHelpers(helpers)
      .toCompileTo('ae-c');
  });

  it('provides each nested helper invocation its own options hash', function() {
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
    expectTemplate('{{equal (equal true true) true}}')
      .withHelpers(helpers)
      .toCompileTo('true');
  });

  it('with hashes', function() {
    expectTemplate("{{blog (equal (equal true true) true fun='yes')}}")
      .withInput({ bar: 'LOL' })
      .withHelpers({
        blog: function(val) {
          return 'val is ' + val;
        },
        equal: function(x, y) {
          return x === y;
        }
      })
      .toCompileTo('val is true');
  });

  it('as hashes', function() {
    expectTemplate("{{blog fun=(equal (blog fun=1) 'val is 1')}}")
      .withHelpers({
        blog: function(options) {
          return 'val is ' + options.hash.fun;
        },
        equal: function(x, y) {
          return x === y;
        }
      })
      .toCompileTo('val is true');
  });

  it('multiple subexpressions in a hash', function() {
    expectTemplate(
      '{{input aria-label=(t "Name") placeholder=(t "Example User")}}'
    )
      .withHelpers({
        input: function(options) {
          var hash = options.hash;
          var ariaLabel = Handlebars.Utils.escapeExpression(hash['aria-label']);
          var placeholder = Handlebars.Utils.escapeExpression(hash.placeholder);
          return new Handlebars.SafeString(
            '<input aria-label="' +
              ariaLabel +
              '" placeholder="' +
              placeholder +
              '" />'
          );
        },
        t: function(defaultString) {
          return new Handlebars.SafeString(defaultString);
        }
      })
      .toCompileTo('<input aria-label="Name" placeholder="Example User" />');
  });

  it('multiple subexpressions in a hash with context', function() {
    expectTemplate(
      '{{input aria-label=(t item.field) placeholder=(t item.placeholder)}}'
    )
      .withInput({
        item: {
          field: 'Name',
          placeholder: 'Example User'
        }
      })
      .withHelpers({
        input: function(options) {
          var hash = options.hash;
          var ariaLabel = Handlebars.Utils.escapeExpression(hash['aria-label']);
          var placeholder = Handlebars.Utils.escapeExpression(hash.placeholder);
          return new Handlebars.SafeString(
            '<input aria-label="' +
              ariaLabel +
              '" placeholder="' +
              placeholder +
              '" />'
          );
        },
        t: function(defaultString) {
          return new Handlebars.SafeString(defaultString);
        }
      })
      .toCompileTo('<input aria-label="Name" placeholder="Example User" />');
  });

  it('in string params mode,', function() {
    expectTemplate('{{snog (blorg foo x=y) yeah a=b}}')
      .withCompileOptions({ stringParams: true })
      .withHelpers({
        snog: function(a, b, options) {
          equals(a, 'foo');
          equals(
            options.types.length,
            2,
            'string params for outer helper processed correctly'
          );
          equals(
            options.types[0],
            'SubExpression',
            'string params for outer helper processed correctly'
          );
          equals(
            options.types[1],
            'PathExpression',
            'string params for outer helper processed correctly'
          );
          return a + b;
        },

        blorg: function(a, options) {
          equals(
            options.types.length,
            1,
            'string params for inner helper processed correctly'
          );
          equals(
            options.types[0],
            'PathExpression',
            'string params for inner helper processed correctly'
          );
          return a;
        }
      })
      .withInput({
        foo: {},
        yeah: {}
      })
      .toCompileTo('fooyeah');
  });

  it('as hashes in string params mode', function() {
    expectTemplate('{{blog fun=(bork)}}')
      .withCompileOptions({ stringParams: true })
      .withHelpers({
        blog: function(options) {
          equals(options.hashTypes.fun, 'SubExpression');
          return 'val is ' + options.hash.fun;
        },
        bork: function() {
          return 'BORK';
        }
      })
      .toCompileTo('val is BORK');
  });

  it('subexpression functions on the context', function() {
    expectTemplate('{{foo (bar)}}!')
      .withInput({
        bar: function() {
          return 'LOL';
        }
      })
      .withHelpers({
        foo: function(val) {
          return val + val;
        }
      })
      .toCompileTo('LOLLOL!');
  });

  it("subexpressions can't just be property lookups", function() {
    expectTemplate('{{foo (bar)}}!')
      .withInput({
        bar: 'LOL'
      })
      .withHelpers({
        foo: function(val) {
          return val + val;
        }
      })
      .toThrow();
  });
});
