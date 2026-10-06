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

    function shouldRejectAst(ast, message) {
      shouldThrow(
        function() {
          Handlebars.compile(ast)();
        },
        Error,
        message
      );
    }

    it('should treat a missing PathExpression depth as 0', function() {
      equal(
        Handlebars.compile(createPathExpressionAST(undefined, ['name']))({
          name: 'ok'
        }),
        'ok'
      );
    });

    it('should reject AST with non-integer PathExpression depth', function() {
      shouldRejectAst(
        createPathExpressionAST('0', ['this']),
        'Invalid AST: PathExpression depth must be a non-negative integer'
      );
    });

    it('should reject AST with negative PathExpression depth', function() {
      shouldRejectAst(
        createPathExpressionAST(-1, ['this']),
        'Invalid AST: PathExpression depth must be a non-negative integer'
      );
    });

    it('should reject AST with fractional PathExpression depth', function() {
      shouldRejectAst(
        createPathExpressionAST(0.5, ['this']),
        'Invalid AST: PathExpression depth must be a non-negative integer'
      );
    });

    it('should reject AST with non-array PathExpression parts', function() {
      shouldRejectAst(
        createPathExpressionAST(0, 'this'),
        'Invalid AST: PathExpression parts must be an array'
      );
    });

    it('should reject AST with non-array PathExpression parts in trackIds mode', function() {
      // With trackIds, pushParam reads the parts of a param before the
      // PathExpression handler validates them.
      shouldThrow(
        function() {
          Handlebars.compile(
            {
              type: 'Program',
              body: [
                {
                  type: 'MustacheStatement',
                  escaped: true,
                  strip: { open: false, close: false },
                  path: {
                    type: 'PathExpression',
                    data: false,
                    depth: 0,
                    parts: ['helper'],
                    original: 'helper'
                  },
                  params: [
                    {
                      type: 'PathExpression',
                      data: false,
                      depth: 0,
                      parts: 'abc',
                      original: 'abc'
                    }
                  ]
                }
              ]
            },
            { trackIds: true }
          )();
        },
        Error,
        'Invalid AST: PathExpression parts must be an array'
      );
    });

    it('should reject AST with non-string PathExpression part', function() {
      shouldRejectAst(
        createPathExpressionAST(0, [1]),
        'Invalid AST: PathExpression parts must only contain strings'
      );
    });

    it('should reject AST with non-boolean BooleanLiteral value', function() {
      shouldRejectAst(
        {
          type: 'Program',
          body: [
            {
              type: 'MustacheStatement',
              escaped: true,
              strip: { open: false, close: false },
              path: {
                type: 'PathExpression',
                data: false,
                depth: 0,
                parts: ['if'],
                original: 'if'
              },
              params: [
                { type: 'BooleanLiteral', value: 'true', original: true }
              ]
            }
          ]
        },
        'Invalid AST: BooleanLiteral value must be a boolean'
      );
    });

    it('should reject AST with non-string StringLiteral value', function() {
      shouldRejectAst(
        {
          type: 'Program',
          body: [
            {
              type: 'MustacheStatement',
              escaped: true,
              strip: { open: false, close: false },
              path: {
                type: 'PathExpression',
                data: false,
                depth: 0,
                parts: ['lookup'],
                original: 'lookup'
              },
              params: [{ type: 'StringLiteral', value: 1, original: 1 }]
            }
          ]
        },
        'Invalid AST: StringLiteral value must be a string'
      );
    });

    it('should reject AST with non-string ContentStatement value', function() {
      shouldRejectAst(
        {
          type: 'Program',
          body: [{ type: 'ContentStatement', value: { toString: 'x' } }]
        },
        'Invalid AST: ContentStatement value must be a string'
      );
    });

    it('should reject AST with non-string hash pair keys', function() {
      shouldRejectAst(
        {
          type: 'Program',
          body: [
            {
              type: 'MustacheStatement',
              escaped: true,
              strip: { open: false, close: false },
              path: {
                type: 'PathExpression',
                data: false,
                depth: 0,
                parts: ['helper'],
                original: 'helper'
              },
              params: [],
              hash: {
                type: 'Hash',
                pairs: [
                  { type: 'HashPair', key: 1, value: { type: 'NullLiteral' } }
                ]
              }
            }
          ]
        },
        'Invalid AST: Hash pair keys must be strings'
      );
    });

    it('should reject AST with non-array hash pairs', function() {
      shouldRejectAst(
        {
          type: 'Program',
          body: [
            {
              type: 'MustacheStatement',
              escaped: true,
              strip: { open: false, close: false },
              path: {
                type: 'PathExpression',
                data: false,
                depth: 0,
                parts: ['helper'],
                original: 'helper'
              },
              params: [],
              hash: { type: 'Hash', pairs: {} }
            }
          ]
        },
        'Invalid AST: Hash pairs must be an array'
      );
    });

    it('should reject AST with non-string known helper name parts', function() {
      shouldRejectAst(
        {
          type: 'Program',
          body: [
            {
              type: 'MustacheStatement',
              escaped: true,
              strip: { open: false, close: false },
              path: {
                type: 'PathExpression',
                data: false,
                depth: 0,
                parts: [['if']],
                original: 'if'
              },
              params: [{ type: 'BooleanLiteral', value: true, original: true }]
            }
          ]
        },
        'Invalid AST: PathExpression parts must only contain strings'
      );
    });

    it('should compile number literals too large to be finite', function() {
      // The parser turns very long number literals into Infinity, which is
      // safe to emit into generated code.
      var digits = new Array(401).join('9'),
        template = '{{echo ' + digits + '}} {{echo -' + digits + '}}',
        options = {
          helpers: {
            echo: function(value) {
              return value;
            }
          }
        };
      equal(Handlebars.compile(template)({}, options), 'Infinity -Infinity');
      equal(
        Handlebars.compile(template, { stringParams: true })({}, options),
        'Infinity -Infinity'
      );
    });

    it('should compile an AST without loc that invokes a helper', function() {
      // Helper calls embed the source location in the generated code; a
      // missing loc must not produce a syntax error.
      var ast = {
        type: 'Program',
        body: [
          {
            type: 'MustacheStatement',
            escaped: true,
            strip: { open: false, close: false },
            path: {
              type: 'PathExpression',
              data: false,
              depth: 0,
              parts: ['greet'],
              original: 'greet'
            },
            params: [
              { type: 'StringLiteral', value: 'world', original: 'world' }
            ]
          }
        ]
      };
      var options = {
        helpers: {
          greet: function(name, options) {
            return 'hello ' + name + (options.loc === undefined ? '' : '!');
          }
        }
      };
      equal(Handlebars.compile(ast)({}, options), 'hello world');
      equal(
        Handlebars.compile(ast, { strict: true })({}, options),
        'hello world'
      );
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

    it('should compile and render templates containing a null character(GH-2059)', function() {
      var nul = String.fromCharCode(0);
      var templateSource = 'Hello ' + nul + ' {{name}}';
      var template = Handlebars.compile(templateSource);
      equal(template({ name: 'World' }), 'Hello ' + nul + ' World');
    });

    it('should compile and render templates containing a null character in a mustache expression(GH-2059)', function() {
      var nul = String.fromCharCode(0);
      var templateSource = 'Hello ' + '{{foo' + nul + 'bar}}';
      var context = {};
      context['foo' + nul + 'bar'] = 'World';
      var template = Handlebars.compile(templateSource);
      equal(template(context), 'Hello World');
    });
  });

  describe('#precompile', function() {
    it('should escape control characters and lone surrogates in lookup names', function() {
      var nul = String.fromCharCode(0),
        loneSurrogate = String.fromCharCode(0xd800),
        template = '{{[a' + nul + 'b]}}{{[c' + loneSurrogate + ']}}',
        context = {};
      context['a' + nul + 'b'] = 'x';
      context['c' + loneSurrogate] = 'y';

      var precompiled = Handlebars.precompile(template);
      expect(precompiled).to.not.contain(nul);
      expect(precompiled).to.not.contain(loneSurrogate);
      equal(
        Handlebars.template(
          new Function('return ' + precompiled)() // eslint-disable-line no-new-func
        )(context),
        'xy'
      );
    });

    it('should escape surrogate pairs on every engine', function() {
      // JSON.stringify leaves surrogate pairs (and, before ES2019, lone
      // surrogates) unescaped, so they are escaped explicitly.
      var emoji = String.fromCharCode(0xd83d, 0xde00),
        template = emoji + '{{[' + emoji + ']}}',
        context = {};
      context[emoji] = emoji;

      var precompiled = Handlebars.precompile(template);
      expect(precompiled).to.not.match(/[\ud800-\udfff]/);
      equal(
        Handlebars.template(
          new Function('return ' + precompiled)() // eslint-disable-line no-new-func
        )(context),
        emoji + emoji
      );
    });

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
