describe('compiler', function () {
  if (!Handlebars.compile) {
    return;
  }

  describe('#equals', function () {
    function compile(string) {
      var ast = Handlebars.parse(string);
      return new Handlebars.Compiler().compile(ast, {});
    }

    it('should treat as equal', function () {
      expect(compile('foo').equals(compile('foo'))).toBe(true);
      expect(compile('{{foo}}').equals(compile('{{foo}}'))).toBe(true);
      expect(compile('{{foo.bar}}').equals(compile('{{foo.bar}}'))).toBe(true);
      expect(
        compile('{{foo.bar baz "foo" true false bat=1}}').equals(
          compile('{{foo.bar baz "foo" true false bat=1}}')
        )
      ).toBe(true);
      expect(
        compile('{{foo.bar (baz bat=1)}}').equals(
          compile('{{foo.bar (baz bat=1)}}')
        )
      ).toBe(true);
      expect(
        compile('{{#foo}} {{/foo}}').equals(compile('{{#foo}} {{/foo}}'))
      ).toBe(true);
    });
    it('should treat as not equal', function () {
      expect(compile('foo').equals(compile('bar'))).toBe(false);
      expect(compile('{{foo}}').equals(compile('{{bar}}'))).toBe(false);
      expect(compile('{{foo.bar}}').equals(compile('{{bar.bar}}'))).toBe(false);
      expect(
        compile('{{foo.bar baz bat=1}}').equals(
          compile('{{foo.bar bar bat=1}}')
        )
      ).toBe(false);
      expect(
        compile('{{foo.bar (baz bat=1)}}').equals(
          compile('{{foo.bar (bar bat=1)}}')
        )
      ).toBe(false);
      expect(
        compile('{{#foo}} {{/foo}}').equals(compile('{{#bar}} {{/bar}}'))
      ).toBe(false);
      expect(
        compile('{{#foo}} {{/foo}}').equals(compile('{{#foo}} {{foo}}{{/foo}}'))
      ).toBe(false);
    });
  });

  describe('#compile', function () {
    it('should fail with invalid input', function () {
      expect(function () {
        Handlebars.compile(null);
      }).toThrow(
        'You must pass a string or Handlebars AST to Handlebars.compile. You passed null'
      );
      expect(function () {
        Handlebars.compile({});
      }).toThrow(
        'You must pass a string or Handlebars AST to Handlebars.compile. You passed [object Object]'
      );
    });

    it('should include the location in the error (row and column)', function () {
      try {
        Handlebars.compile(' \n  {{#if}}\n{{/def}}')();
        expect.unreachable('Statement must throw exception');
      } catch (err) {
        expect(err.message).toBe("if doesn't match def - 2:5");
        if (Object.getOwnPropertyDescriptor(err, 'column').writable) {
          // In Safari 8, the column-property is read-only. This means that even if it is set with defineProperty,
          // its value won't change (https://github.com/jquery/esprima/issues/1290#issuecomment-132455482)
          // Since this was neither working in Handlebars 3 nor in 4.0.5, we only check the column for other browsers.
          expect(err.column).toBe(5);
        }
        expect(err.lineNumber).toBe(2);
      }
    });

    it('should include the location as enumerable property', function () {
      try {
        Handlebars.compile(' \n  {{#if}}\n{{/def}}')();
        expect.unreachable('Statement must throw exception');
      } catch (err) {
        expect(Object.prototype.propertyIsEnumerable.call(err, 'column')).toBe(
          true
        );
      }
    });

    it('can utilize AST instance', function () {
      expect(
        Handlebars.compile({
          type: 'Program',
          body: [{ type: 'ContentStatement', value: 'Hello' }],
        })()
      ).toBe('Hello');
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
              original: 'this',
            },
            params: [],
          },
        ],
      };
    }

    function shouldRejectAst(ast, message) {
      expect(function () {
        Handlebars.compile(ast)();
      }).toThrow(message);
    }

    it('should treat a missing PathExpression depth as 0', function () {
      expect(
        Handlebars.compile(createPathExpressionAST(undefined, ['name']))({
          name: 'ok',
        })
      ).toBe('ok');
    });

    it('should reject AST with non-integer PathExpression depth', function () {
      shouldRejectAst(
        createPathExpressionAST('0', ['this']),
        'Invalid AST: PathExpression depth must be a non-negative integer'
      );
    });

    it('should reject AST with negative PathExpression depth', function () {
      shouldRejectAst(
        createPathExpressionAST(-1, ['this']),
        'Invalid AST: PathExpression depth must be a non-negative integer'
      );
    });

    it('should reject AST with fractional PathExpression depth', function () {
      shouldRejectAst(
        createPathExpressionAST(0.5, ['this']),
        'Invalid AST: PathExpression depth must be a non-negative integer'
      );
    });

    it('should reject AST with non-array PathExpression parts', function () {
      shouldRejectAst(
        createPathExpressionAST(0, 'this'),
        'Invalid AST: PathExpression parts must be an array'
      );
    });

    it('should reject AST with non-string PathExpression part', function () {
      shouldRejectAst(
        createPathExpressionAST(0, [1]),
        'Invalid AST: PathExpression parts must only contain strings'
      );
    });

    it('should reject AST with non-boolean BooleanLiteral value', function () {
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
                original: 'if',
              },
              params: [
                { type: 'BooleanLiteral', value: 'true', original: true },
              ],
            },
          ],
        },
        'Invalid AST: BooleanLiteral value must be a boolean'
      );
    });

    it('should reject AST with non-string StringLiteral value', function () {
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
                original: 'lookup',
              },
              params: [{ type: 'StringLiteral', value: 1, original: 1 }],
            },
          ],
        },
        'Invalid AST: StringLiteral value must be a string'
      );
    });

    it('should reject AST with non-string ContentStatement value', function () {
      shouldRejectAst(
        {
          type: 'Program',
          body: [{ type: 'ContentStatement', value: { toString: 'x' } }],
        },
        'Invalid AST: ContentStatement value must be a string'
      );
    });

    it('should reject AST with non-string hash pair keys', function () {
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
                original: 'helper',
              },
              params: [],
              hash: {
                type: 'Hash',
                pairs: [
                  { type: 'HashPair', key: 1, value: { type: 'NullLiteral' } },
                ],
              },
            },
          ],
        },
        'Invalid AST: Hash pair keys must be strings'
      );
    });

    it('should reject AST with non-array hash pairs', function () {
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
                original: 'helper',
              },
              params: [],
              hash: { type: 'Hash', pairs: {} },
            },
          ],
        },
        'Invalid AST: Hash pairs must be an array'
      );
    });

    it('should reject AST with non-string known helper name parts', function () {
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
                original: 'if',
              },
              params: [{ type: 'BooleanLiteral', value: true, original: true }],
            },
          ],
        },
        'Invalid AST: PathExpression parts must only contain strings'
      );
    });

    it('should compile number literals too large to be finite', function () {
      // The parser turns very long number literals into Infinity, which is
      // safe to emit into generated code.
      var digits = '9'.repeat(400),
        template = '{{echo ' + digits + '}} {{echo -' + digits + '}}',
        options = {
          helpers: {
            echo: function (value) {
              return value;
            },
          },
        };
      expect(Handlebars.compile(template)({}, options)).toBe(
        'Infinity -Infinity'
      );
    });

    it('should compile an AST without loc that invokes a helper', function () {
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
              original: 'greet',
            },
            params: [
              { type: 'StringLiteral', value: 'world', original: 'world' },
            ],
          },
        ],
      };
      var options = {
        helpers: {
          greet: function (name, options) {
            return 'hello ' + name + (options.loc === undefined ? '' : '!');
          },
        },
      };
      expect(Handlebars.compile(ast)({}, options)).toBe('hello world');
      expect(Handlebars.compile(ast, { strict: true })({}, options)).toBe(
        'hello world'
      );
    });

    it('should ignore loc metadata in AST nodes', function () {
      expect(
        Handlebars.compile({
          type: 'Program',
          meta: null,
          loc: { source: 'fake', start: { line: 1, column: 0 } },
          body: [{ type: 'ContentStatement', value: 'Hello' }],
        })()
      ).toBe('Hello');
    });

    it('should accept AST with valid NumberLiteral values', function () {
      expect(
        Handlebars.compile(Handlebars.parse('{{lookup this 1}}'))(['a', 'b'])
      ).toBe('b');
    });

    it('should accept AST with valid BooleanLiteral values', function () {
      expect(
        Handlebars.compile(Handlebars.parse('{{#if true}}ok{{/if}}'))({})
      ).toBe('ok');
    });

    it('can pass through an empty string', function () {
      expect(Handlebars.compile('')()).toBe('');
    });

    it('throws on desupported options', function () {
      expect(function () {
        Handlebars.compile('Dudes', { trackIds: true });
      }).toThrow(
        'TrackIds and stringParams are no longer supported. See Github #1145'
      );
      expect(function () {
        Handlebars.compile('Dudes', { stringParams: true });
      }).toThrow(
        'TrackIds and stringParams are no longer supported. See Github #1145'
      );
    });

    it('should not modify the options.data property(GH-1327)', function () {
      var options = { data: [{ a: 'foo' }, { a: 'bar' }] };
      Handlebars.compile('{{#each data}}{{@index}}:{{a}} {{/each}}', options)();
      expect(options).toStrictEqual({ data: [{ a: 'foo' }, { a: 'bar' }] });
    });

    it('should not modify the options.knownHelpers property(GH-1327)', function () {
      var options = { knownHelpers: {} };
      Handlebars.compile('{{#each data}}{{@index}}:{{a}} {{/each}}', options)();
      expect(options).toStrictEqual({ knownHelpers: {} });
    });
  });

  describe('#precompile', function () {
    it('should escape control characters and lone surrogates in lookup names', function () {
      var nul = String.fromCharCode(0),
        loneSurrogate = String.fromCharCode(0xd800),
        template = '{{[a' + nul + 'b]}}{{[c' + loneSurrogate + ']}}',
        context = {};
      context['a' + nul + 'b'] = 'x';
      context['c' + loneSurrogate] = 'y';

      var precompiled = Handlebars.precompile(template);
      expect(precompiled).not.toContain(nul);
      expect(precompiled).not.toContain(loneSurrogate);
      // oxlint-disable-next-line no-new-func
      var templateSpec = new Function('return ' + precompiled)();
      expect(Handlebars.template(templateSpec)(context)).toBe('xy');
    });

    it('should escape surrogate pairs on every engine', function () {
      // JSON.stringify leaves surrogate pairs (and, before ES2019, lone
      // surrogates) unescaped, so they are escaped explicitly.
      var emoji = String.fromCharCode(0xd83d, 0xde00),
        template = emoji + '{{[' + emoji + ']}}',
        context = {};
      context[emoji] = emoji;

      var precompiled = Handlebars.precompile(template);
      expect(precompiled).not.toMatch(/[\ud800-\udfff]/);
      // oxlint-disable-next-line no-new-func
      var templateSpec = new Function('return ' + precompiled)();
      expect(Handlebars.template(templateSpec)(context)).toBe(emoji + emoji);
    });

    it('should fail with invalid input', function () {
      expect(function () {
        Handlebars.precompile(null);
      }).toThrow(
        'You must pass a string or Handlebars AST to Handlebars.compile. You passed null'
      );
      expect(function () {
        Handlebars.precompile({});
      }).toThrow(
        'You must pass a string or Handlebars AST to Handlebars.compile. You passed [object Object]'
      );
    });

    it('can utilize AST instance', function () {
      expect(
        Handlebars.precompile({
          type: 'Program',
          body: [{ type: 'ContentStatement', value: 'Hello' }],
        })
      ).toMatch(/return "Hello"/);
    });

    it('can pass through an empty string', function () {
      expect(Handlebars.precompile('')).toMatch(/return ""/);
    });
  });
});
