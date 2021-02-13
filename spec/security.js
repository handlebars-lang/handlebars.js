describe('security issues', function() {
    describe('GH-1495: Prevent Remote Code Execution via constructor', function() {
      checkPropertyAccess({});

      describe('in compat-mode', function() {
        checkPropertyAccess({ compat: true });
      });

      describe('in strict-mode', function() {
        checkPropertyAccess({ strict: true });
      });


      function checkPropertyAccess(compileOptions) {
        it('should allow the "constructor" property to be accessed if it is enumerable', function() {
          expectTemplate('{{constructor.name}}')
            .withCompileOptions(compileOptions)
            .withInput({'constructor': {
              'name': 'here we go'
            }})
            .toCompileTo('here we go');
          expectTemplate('{{lookup (lookup this "constructor") "name"}}')
            .withCompileOptions(compileOptions)
            .withInput({'constructor': {
              'name': 'here we go'
            }})
            .toCompileTo('here we go');
        });

        it('should allow prototype properties that are not constructors', function() {
            function TestClass() {
            }

            Object.defineProperty(TestClass.prototype, 'abc', {
                get: function() {
                    return 'xyz';
                }
            });


            expectTemplate('{{#with this}}{{this.abc}}{{/with}}')
              .withCompileOptions(compileOptions)
              .withInput(new TestClass())
              .toCompileTo('xyz');

            expectTemplate('{{#with this}}{{lookup this "abc"}}{{/with}}')
              .withCompileOptions(compileOptions)
              .withInput(new TestClass())
              .toCompileTo('xyz');
        });

        it('should not allow constructors to be accessed', function() {
          expectTemplate('{{lookup (lookup this "constructor") "name"}}')
            .withCompileOptions(compileOptions)
            .withInput({})
            .toCompileTo('');
          if (compileOptions.strict) {
            expectTemplate('{{constructor.name}}')
              .withCompileOptions(compileOptions)
              .withInput({})
              .toThrow(TypeError);
          } else {
            expectTemplate('{{constructor.name}}')
              .withCompileOptions(compileOptions)
              .withInput({})
              .toCompileTo('');
          }
        });

        it('should not allow __proto__ to be accessed', function() {
          expectTemplate('{{lookup (lookup this "__proto__") "name"}}')
            .withCompileOptions(compileOptions)
            .withInput({})
            .toCompileTo('');
          if (compileOptions.strict) {
            expectTemplate('{{__proto__.name}}')
              .withCompileOptions(compileOptions)
              .withInput({})
              .toThrow(TypeError);
          } else {
            expectTemplate('{{__proto__.name}}')
              .withCompileOptions(compileOptions)
              .withInput({})
              .toCompileTo('');
          }
        });

      }
    });

    describe('GH-1595', function() {
        it('properties, that are required to be enumerable', function() {
            shouldCompileTo('{{constructor.name}}', {}, '');
            shouldCompileTo('{{__defineGetter__.name}}', {}, '');
            shouldCompileTo('{{__defineSetter__.name}}', {}, '');
            shouldCompileTo('{{__lookupGetter__.name}}', {}, '');
            shouldCompileTo('{{__proto__.__defineGetter__.name}}', {}, '');

            shouldCompileTo('{{lookup this "constructor"}}', {}, '');
            shouldCompileTo('{{lookup this "__defineGetter__"}}', {}, '');
            shouldCompileTo('{{lookup this "__defineSetter__"}}', {}, '');
            shouldCompileTo('{{lookup this "__lookupGetter__"}}', {}, '');
            shouldCompileTo('{{lookup this "__proto__"}}', {}, '');
        });
    });

  describe('escapes template variables', function() {
    it('in compat mode', function() {
      expectTemplate("{{'a\\b'}}")
        .withCompileOptions({ compat: true })
        .withInput({ 'a\\b': 'c' })
        .toCompileTo('c');
    });

    it('in default mode', function() {
      expectTemplate("{{'a\\b'}}")
        .withCompileOptions()
        .withInput({ 'a\\b': 'c' })
        .toCompileTo('c');
    });
    it('in default mode', function() {
      expectTemplate("{{'a\\b'}}")
        .withCompileOptions({ strict: true })
        .withInput({ 'a\\b': 'c' })
        .toCompileTo('c');
    });
  });
});
