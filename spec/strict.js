var Exception = Handlebars.Exception;

describe('strict', function () {
  describe('strict mode', function () {
    it('should error on missing property lookup', function () {
      expectTemplate('{{hello}}')
        .withCompileOptions({ strict: true })
        .toThrow(Exception, /"hello" not defined in/);
    });

    it('should error on missing child', function () {
      expectTemplate('{{hello.bar}}')
        .withCompileOptions({ strict: true })
        .withInput({ hello: { bar: 'foo' } })
        .toCompileTo('foo');

      expectTemplate('{{hello.bar}}')
        .withCompileOptions({ strict: true })
        .withInput({ hello: {} })
        .toThrow(Exception, /"bar" not defined in/);
    });

    it('should handle explicit undefined', function () {
      expectTemplate('{{hello.bar}}')
        .withCompileOptions({ strict: true })
        .withInput({ hello: { bar: undefined } })
        .toCompileTo('');
    });

    it('should error on missing property lookup in known helpers mode', function () {
      expectTemplate('{{hello}}')
        .withCompileOptions({
          strict: true,
          knownHelpersOnly: true,
        })
        .toThrow(Exception, /"hello" not defined in/);
    });

    it('should error on missing context', function () {
      expectTemplate('{{hello}}')
        .withCompileOptions({ strict: true })
        .toThrow(Error);
    });

    it('should error on missing data lookup', function () {
      var xt = expectTemplate('{{@hello}}').withCompileOptions({
        strict: true,
      });

      xt.toThrow(Error);

      xt.withRuntimeOptions({ data: { hello: 'foo' } }).toCompileTo('foo');
    });

    it('should not run helperMissing for helper calls', function () {
      expectTemplate('{{hello foo}}')
        .withCompileOptions({ strict: true })
        .withInput({ foo: true })
        .toThrow(Exception, /"hello" not defined in/);

      expectTemplate('{{#hello foo}}{{/hello}}')
        .withCompileOptions({ strict: true })
        .withInput({ foo: true })
        .toThrow(Exception, /"hello" not defined in/);
    });

    it('should throw on ambiguous blocks', function () {
      expectTemplate('{{#hello}}{{/hello}}')
        .withCompileOptions({ strict: true })
        .toThrow(Exception, /"hello" not defined in/);

      expectTemplate('{{^hello}}{{/hello}}')
        .withCompileOptions({ strict: true })
        .toThrow(Exception, /"hello" not defined in/);

      expectTemplate('{{#hello.bar}}{{/hello.bar}}')
        .withCompileOptions({ strict: true })
        .withInput({ hello: {} })
        .toThrow(Exception, /"bar" not defined in/);
    });

    it('should allow undefined parameters when passed to helpers', function () {
      expectTemplate('{{#unless foo}}success{{/unless}}')
        .withCompileOptions({ strict: true })
        .toCompileTo('success');
    });

    it('should allow undefined hash when passed to helpers', function () {
      expectTemplate('{{helper value=@foo}}')
        .withCompileOptions({
          strict: true,
        })
        .withHelpers({
          helper: function (options) {
            expect(options.hash).toHaveProperty('value');
            expect(options.hash.value).toBeUndefined();
            return 'success';
          },
        })
        .toCompileTo('success');
    });

    it('should show error location on missing property lookup', function () {
      expectTemplate('\n\n\n   {{hello}}')
        .withCompileOptions({ strict: true })
        .toThrow(Exception, '"hello" not defined in [object Object] - 4:5');
    });

    it('should error contains correct location properties on missing property lookup', function () {
      try {
        var template = CompilerContext.compile('\n\n\n   {{hello}}', {
          strict: true,
        });
        template({});
      } catch (error) {
        expect(error.lineNumber).toBe(4);
        expect(error.endLineNumber).toBe(4);
        expect(error.column).toBe(5);
        expect(error.endColumn).toBe(10);
      }
    });
  });

  describe('strict and compat mode', function () {
    it('GH-1741: should render a simple variable', function () {
      expectTemplate('{{v}}')
        .withCompileOptions({ strict: true, compat: true })
        .withInput({ v: 'a' })
        .toCompileTo('a');
    });

    it('should throw for a missing variable', function () {
      expectTemplate('{{v}}')
        .withCompileOptions({ strict: true, compat: true })
        .toThrow(Exception, /"v" not defined in/);
    });

    it('GH-2149: should render correctly when block context is a boolean', function () {
      expectTemplate('{{#foo}}Hello {{bar}}{{/foo}}')
        .withCompileOptions({ strict: true, compat: true })
        .withInput({ foo: true, bar: 'World' })
        .toCompileTo('Hello World');
    });

    it('GH-2149: should render correctly when looking up a property on each item', function () {
      expectTemplate('{{#each items}}{{name}}{{/each}}')
        .withCompileOptions({ strict: true, compat: true })
        .withInput({ items: [{ name: 'Hello' }] })
        .toCompileTo('Hello');
    });

    it('should still throw when a property is missing at all depths', function () {
      expectTemplate('{{#each items}}{{name}}{{/each}}')
        .withCompileOptions({ strict: true, compat: true })
        .withInput({ items: [1, 2] })
        .toThrow(Exception, /"name" not defined in/);
    });

    it('should still perform recursive lookup when a property is not in the current context', function () {
      expectTemplate('{{#each items}}{{name}}{{/each}}')
        .withCompileOptions({ strict: true, compat: true })
        .withInput({ name: 'root', items: [{}] })
        .toCompileTo('root');
    });

    it('should still perform recursive lookup with a multi-part path not in context', function () {
      expectTemplate('{{#with child}}{{name.first}}{{/with}}')
        .withCompileOptions({ strict: true, compat: true })
        .withInput({ name: { first: 'root' }, child: { name: null } })
        .toCompileTo('root');
    });

    it('should directly return an explicitly null property', function () {
      expectTemplate('{{#each items}}{{name}}{{/each}}')
        .withCompileOptions({ strict: true, compat: true })
        .withInput({ name: 'root', items: [{ name: null }] })
        .toCompileTo('');
    });
  });

  describe('assume objects', function () {
    it('should ignore missing property', function () {
      expectTemplate('{{hello}}')
        .withCompileOptions({ assumeObjects: true })
        .toCompileTo('');
    });

    it('should ignore missing child', function () {
      expectTemplate('{{hello.bar}}')
        .withCompileOptions({ assumeObjects: true })
        .withInput({ hello: {} })
        .toCompileTo('');
    });

    it('should error on missing object', function () {
      expectTemplate('{{hello.bar}}')
        .withCompileOptions({ assumeObjects: true })
        .toThrow(Error);
    });

    it('should error on missing context', function () {
      expectTemplate('{{hello}}')
        .withCompileOptions({ assumeObjects: true })
        .withInput(undefined)
        .toThrow(Error);
    });

    it('should error on missing data lookup', function () {
      expectTemplate('{{@hello.bar}}')
        .withCompileOptions({ assumeObjects: true })
        .withInput(undefined)
        .toThrow(Error);
    });

    it('should execute blockHelperMissing', function () {
      expectTemplate('{{^hello}}foo{{/hello}}')
        .withCompileOptions({ assumeObjects: true })
        .toCompileTo('foo');
    });
  });
});
