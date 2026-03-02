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
