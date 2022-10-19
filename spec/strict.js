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
            equals('value' in options.hash, true);
            equals(options.hash.value, undefined);
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
        equals(error.lineNumber, 4);
        equals(error.endLineNumber, 4);
        equals(error.column, 5);
        equals(error.endColumn, 10);
      }
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
