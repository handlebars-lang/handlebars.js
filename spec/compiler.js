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
      equal(
        compile('{{foo.bar baz "foo" true false bat=1}}').equals(
          compile('{{foo.bar baz "foo" true false bat=1}}')
        ),
        true
      );
      equal(
        compile('{{foo.bar (baz bat=1)}}').equals(
          compile('{{foo.bar (baz bat=1)}}')
        ),
        true
      );
      equal(
        compile('{{#foo}} {{/foo}}').equals(compile('{{#foo}} {{/foo}}')),
        true
      );
    });
    it('should treat as not equal', function() {
      equal(compile('foo').equals(compile('bar')), false);
      equal(compile('{{foo}}').equals(compile('{{bar}}')), false);
      equal(compile('{{foo.bar}}').equals(compile('{{bar.bar}}')), false);
      equal(
        compile('{{foo.bar baz bat=1}}').equals(
          compile('{{foo.bar bar bat=1}}')
        ),
        false
      );
      equal(
        compile('{{foo.bar (baz bat=1)}}').equals(
          compile('{{foo.bar (bar bat=1)}}')
        ),
        false
      );
      equal(
        compile('{{#foo}} {{/foo}}').equals(compile('{{#bar}} {{/bar}}')),
        false
      );
      equal(
        compile('{{#foo}} {{/foo}}').equals(
          compile('{{#foo}} {{foo}}{{/foo}}')
        ),
        false
      );
    });
  });

  describe('#compile', function() {
    it('should fail with invalid input', function() {
      shouldThrow(
        function() {
          Handlebars.compile(null);
        },
        Error,
        'You must pass a string or Handlebars AST to Handlebars.compile. You passed null'
      );
      shouldThrow(
        function() {
          Handlebars.compile({});
        },
        Error,
        'You must pass a string or Handlebars AST to Handlebars.compile. You passed [object Object]'
      );
    });

    it('should include the location in the error (row and column)', function() {
      try {
        Handlebars.compile(' \n  {{#if}}\n{{/def}}')();
        equal(
          true,
          false,
          'Statement must throw exception. This line should not be executed.'
        );
      } catch (err) {
        equal(
          err.message,
          "if doesn't match def - 2:5",
          'Checking error message'
        );
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
        equal(
          true,
          false,
          'Statement must throw exception. This line should not be executed.'
        );
      } catch (err) {
        equal(
          Object.prototype.propertyIsEnumerable.call(err, 'column'),
          true,
          'Checking error column'
        );
      }
    });

    it('can utilize AST instance', function() {
      equal(
        Handlebars.compile({
          type: 'Program',
          body: [{ type: 'ContentStatement', value: 'Hello' }]
        })(),
        'Hello'
      );
    });

    function createPathExpressionAST(depth, parts) {
      return {
        type: 'Program',
        body: [
          {
            type: 'MustacheStatement',
            escaped: true,
            strip: { open: false, close: false },
            path: {
              type: 'PathExpression',
              data: false,
              depth: depth,
              parts: parts,
              original: 'this'
            },
            params: []
          }
        ]
      };
    }

    it('should safely handle AST with non-integer PathExpression depth', function() {
      // depth '0' is coerced to 0 via Number(), compiles safely
      var result = Handlebars.compile(createPathExpressionAST('0', ['this']))();
      expect(result).to.be.a('string');
    });

    it('should safely handle AST with negative PathExpression depth', function() {
      // Negative depth is clamped to 0
      var result = Handlebars.compile(createPathExpressionAST(-1, ['this']))();
      expect(result).to.be.a('string');
    });

    it('should safely handle AST with fractional PathExpression depth', function() {
      // Fractional depth is floored to an integer
      var result = Handlebars.compile(createPathExpressionAST(0.5, ['this']))();
      expect(result).to.be.a('string');
    });

    it('should safely handle AST with non-array PathExpression parts', function() {
      // Non-array parts are coerced to empty array, compiles safely
      var result = Handlebars.compile(createPathExpressionAST(0, 'this'))();
      expect(result).to.be.a('string');
    });

    it('should safely handle AST with non-string PathExpression part', function() {
      // Non-string parts are coerced to strings via String()
      var result = Handlebars.compile(createPathExpressionAST(0, [1]))();
      expect(result).to.be.a('string');
    });

    it('should safely handle AST with non-boolean BooleanLiteral value type', function() {
      // The compiler coerces BooleanLiteral.value via === true before
      // emitting a pushLiteral opcode, so a non-boolean value like the
      // string 'true' becomes the literal 'false'.
      var loc = {
        source: null,
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 }
      };
      var result = Handlebars.compile({
        type: 'Program',
        body: [
          {
            type: 'MustacheStatement',
            escaped: true,
            strip: { open: false, close: false },
            loc: loc,
            path: {
              type: 'BooleanLiteral',
              value: 'true',
              original: true,
              loc: loc
            },
            params: []
          }
        ]
      })();
      // 'true' !== true, so the compiler emits pushLiteral('false').
      // Handlebars does not render falsy values, so the output is empty.
      expect(result).to.equal('');
    });

    it('should ignore loc metadata in AST nodes', function() {
      equal(
        Handlebars.compile({
          type: 'Program',
          meta: null,
          loc: { source: 'fake', start: { line: 1, column: 0 } },
          body: [{ type: 'ContentStatement', value: 'Hello' }]
        })(),
        'Hello'
      );
    });

    it('should accept AST with valid NumberLiteral values', function() {
      equal(
        Handlebars.compile(Handlebars.parse('{{lookup this 1}}'))(['a', 'b']),
        'b'
      );
    });

    it('should accept AST with valid BooleanLiteral values', function() {
      equal(
        Handlebars.compile(Handlebars.parse('{{#if true}}ok{{/if}}'))({}),
        'ok'
      );
    });

    it('can pass through an empty string', function() {
      equal(Handlebars.compile('')(), '');
    });

    it('should not modify the options.data property(GH-1327)', function() {
      var options = { data: [{ a: 'foo' }, { a: 'bar' }] };
      Handlebars.compile('{{#each data}}{{@index}}:{{a}} {{/each}}', options)();
      equal(
        JSON.stringify(options, 0, 2),
        JSON.stringify({ data: [{ a: 'foo' }, { a: 'bar' }] }, 0, 2)
      );
    });

    it('should not modify the options.knownHelpers property(GH-1327)', function() {
      var options = { knownHelpers: {} };
      Handlebars.compile('{{#each data}}{{@index}}:{{a}} {{/each}}', options)();
      equal(
        JSON.stringify(options, 0, 2),
        JSON.stringify({ knownHelpers: {} }, 0, 2)
      );
    });
  });

  describe('#precompile', function() {
    it('should fail with invalid input', function() {
      shouldThrow(
        function() {
          Handlebars.precompile(null);
        },
        Error,
        'You must pass a string or Handlebars AST to Handlebars.precompile. You passed null'
      );
      shouldThrow(
        function() {
          Handlebars.precompile({});
        },
        Error,
        'You must pass a string or Handlebars AST to Handlebars.precompile. You passed [object Object]'
      );
    });

    it('can utilize AST instance', function() {
      equal(
        /return "Hello"/.test(
          Handlebars.precompile({
            type: 'Program',
            body: [{ type: 'ContentStatement', value: 'Hello' }]
          })
        ),
        true
      );
    });

    it('can pass through an empty string', function() {
      equal(/return ""/.test(Handlebars.precompile('')), true);
    });
  });
});
