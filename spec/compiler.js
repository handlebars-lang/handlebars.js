describe('compiler', function() {
  if (!Handlebars.compile) {
    return;
  }

  describe('#equals', function() {
    function compile(string) {
      var ast = Handlebars.parse(string);
      return new Handlebars.Compiler().compile(ast, {});
    }

    it('should treat as equal', function() {
      equal(compile('foo').equals(compile('foo')), true);
      equal(compile('{{foo}}').equals(compile('{{foo}}')), true);
      equal(compile('{{foo.bar}}').equals(compile('{{foo.bar}}')), true);
      equal(compile('{{foo.bar baz "foo" true false bat=1}}').equals(compile('{{foo.bar baz "foo" true false bat=1}}')), true);
      equal(compile('{{foo.bar (baz bat=1)}}').equals(compile('{{foo.bar (baz bat=1)}}')), true);
      equal(compile('{{#foo}} {{/foo}}').equals(compile('{{#foo}} {{/foo}}')), true);
    });
    it('should treat as not equal', function() {
      equal(compile('foo').equals(compile('bar')), false);
      equal(compile('{{foo}}').equals(compile('{{bar}}')), false);
      equal(compile('{{foo.bar}}').equals(compile('{{bar.bar}}')), false);
      equal(compile('{{foo.bar baz bat=1}}').equals(compile('{{foo.bar bar bat=1}}')), false);
      equal(compile('{{foo.bar (baz bat=1)}}').equals(compile('{{foo.bar (bar bat=1)}}')), false);
      equal(compile('{{#foo}} {{/foo}}').equals(compile('{{#bar}} {{/bar}}')), false);
      equal(compile('{{#foo}} {{/foo}}').equals(compile('{{#foo}} {{foo}}{{/foo}}')), false);
    });
  });

  describe('#compile', function() {
    it('should fail with invalid input', function() {
      shouldThrow(function() {
        Handlebars.compile(null);
      }, Error, 'You must pass a string or Handlebars AST to Handlebars.compile. You passed null');
      shouldThrow(function() {
        Handlebars.compile({});
      }, Error, 'You must pass a string or Handlebars AST to Handlebars.compile. You passed [object Object]');
    });

    it('should include the location in the error (row and column)', function() {
      try {
        Handlebars.compile(' \n  {{#if}}\n{{/def}}')();
        equal(true, false, 'Statement must throw exception. This line should not be executed.');
      } catch (err) {
        equal(err.message, 'if doesn\'t match def - 2:5', 'Checking error message');
        if (Object.getOwnPropertyDescriptor(err, 'column').writable) {
          // In Safari 8, the column-property is read-only. This means that even if it is set with defineProperty,
          // its value won't change (https://github.com/jquery/esprima/issues/1290#issuecomment-132455482)
          // Since this was neither working in Handlebars 3 nor in 4.0.5, we only check the column for other browsers.
          equal(err.column, 5, 'Checking error column');
        }
        equal(err.lineNumber, 2, 'Checking error row');
      }
    });

    it('should include the location as enumerable property', function() {
      try {
        Handlebars.compile(' \n  {{#if}}\n{{/def}}')();
        equal(true, false, 'Statement must throw exception. This line should not be executed.');
      } catch (err) {
        equal(err.propertyIsEnumerable('column'), true, 'Checking error column');
      }
    });

    it('can utilize AST instance', function() {
      equal(Handlebars.compile({
        type: 'Program',
        body: [ {type: 'ContentStatement', value: 'Hello'}]
      })(), 'Hello');
    });

    it('can pass through an empty string', function() {
      equal(Handlebars.compile('')(), '');
    });

    it('throws on desupported options', function() {
      shouldThrow(function() {
        Handlebars.compile('Dudes', {trackIds: true});
      }, Error, 'TrackIds and stringParams are no longer supported. See Github #1145');
      shouldThrow(function() {
        Handlebars.compile('Dudes', {stringParams: true});
      }, Error, 'TrackIds and stringParams are no longer supported. See Github #1145');
    });
  });

  describe('#precompile', function() {
    it('should fail with invalid input', function() {
      shouldThrow(function() {
        Handlebars.precompile(null);
      }, Error, 'You must pass a string or Handlebars AST to Handlebars.compile. You passed null');
      shouldThrow(function() {
        Handlebars.precompile({});
      }, Error, 'You must pass a string or Handlebars AST to Handlebars.compile. You passed [object Object]');
    });

    it('can utilize AST instance', function() {
      equal(/return "Hello"/.test(Handlebars.precompile({
        type: 'Program',
        body: [ {type: 'ContentStatement', value: 'Hello'}]
      })), true);
    });

    it('can pass through an empty string', function() {
      equal(/return ""/.test(Handlebars.precompile('')), true);
    });
  });
});
