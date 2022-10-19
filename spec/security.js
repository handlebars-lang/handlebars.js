describe('security issues', function () {
  describe('GH-1495: Prevent Remote Code Execution via constructor', function () {
    it('should not allow constructors to be accessed', function () {
      expectTemplate('{{lookup (lookup this "constructor") "name"}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{constructor.name}}').withInput({}).toCompileTo('');
    });

    it('GH-1603: should not allow constructors to be accessed (lookup via toString)', function () {
      expectTemplate('{{lookup (lookup this (list "constructor")) "name"}}')
        .withInput({})
        .withHelper('list', function (element) {
          return [element];
        })
        .toCompileTo('');
    });

    it('should allow the "constructor" property to be accessed if it is an "ownProperty"', function () {
      expectTemplate('{{constructor.name}}')
        .withInput({ constructor: { name: 'here we go' } })
        .toCompileTo('here we go');

      expectTemplate('{{lookup (lookup this "constructor") "name"}}')
        .withInput({ constructor: { name: 'here we go' } })
        .toCompileTo('here we go');
    });

    it('should allow the "constructor" property to be accessed if it is an "own property"', function () {
      expectTemplate('{{lookup (lookup this "constructor") "name"}}')
        .withInput({ constructor: { name: 'here we go' } })
        .toCompileTo('here we go');
    });
  });

  describe('GH-1558: Prevent explicit call of helperMissing-helpers', function () {
    if (!Handlebars.compile) {
      return;
    }

    describe('without the option "allowExplicitCallOfHelperMissing"', function () {
      it('should throw an exception when calling  "{{helperMissing}}" ', function () {
        expectTemplate('{{helperMissing}}').toThrow(Error);
      });

      it('should throw an exception when calling  "{{#helperMissing}}{{/helperMissing}}" ', function () {
        expectTemplate('{{#helperMissing}}{{/helperMissing}}').toThrow(Error);
      });

      it('should throw an exception when calling  "{{blockHelperMissing "abc" .}}" ', function () {
        var functionCalls = [];
        expect(function () {
          var template = Handlebars.compile('{{blockHelperMissing "abc" .}}');
          template({
            fn: function () {
              functionCalls.push('called');
            },
          });
        }).to.throw(Error);
        expect(functionCalls.length).to.equal(0);
      });

      it('should throw an exception when calling  "{{#blockHelperMissing .}}{{/blockHelperMissing}}"', function () {
        expectTemplate('{{#blockHelperMissing .}}{{/blockHelperMissing}}')
          .withInput({
            fn: function () {
              return 'functionInData';
            },
          })
          .toThrow(Error);
      });
    });

    describe('with the option "allowCallsToHelperMissing" set to true', function () {
      it('should not throw an exception when calling  "{{helperMissing}}" ', function () {
        var template = Handlebars.compile('{{helperMissing}}');
        template({}, { allowCallsToHelperMissing: true });
      });

      it('should not throw an exception when calling  "{{#helperMissing}}{{/helperMissing}}" ', function () {
        var template = Handlebars.compile(
          '{{#helperMissing}}{{/helperMissing}}'
        );
        template({}, { allowCallsToHelperMissing: true });
      });

      it('should not throw an exception when calling  "{{blockHelperMissing "abc" .}}" ', function () {
        var functionCalls = [];
        var template = Handlebars.compile('{{blockHelperMissing "abc" .}}');
        template(
          {
            fn: function () {
              functionCalls.push('called');
            },
          },
          { allowCallsToHelperMissing: true }
        );
        equals(functionCalls.length, 1);
      });

      it('should not throw an exception when calling  "{{#blockHelperMissing .}}{{/blockHelperMissing}}"', function () {
        var template = Handlebars.compile(
          '{{#blockHelperMissing true}}sdads{{/blockHelperMissing}}'
        );
        template({}, { allowCallsToHelperMissing: true });
      });
    });
  });

  describe('GH-1563', function () {
    it('should not allow to access constructor after overriding via __defineGetter__', function () {
      if ({}.__defineGetter__ == null || {}.__lookupGetter__ == null) {
        return this.skip(); // Browser does not support this exploit anyway
      }
      expectTemplate(
        '{{__defineGetter__ "undefined" valueOf }}' +
          '{{#with __lookupGetter__ }}' +
          '{{__defineGetter__ "propertyIsEnumerable" (this.bind (this.bind 1)) }}' +
          '{{constructor.name}}' +
          '{{/with}}'
      )
        .withInput({})
        .toThrow(/Missing helper: "__defineGetter__"/);
    });
  });

  describe('GH-1595: dangerous properties', function () {
    var templates = [
      '{{constructor}}',
      '{{__defineGetter__}}',
      '{{__defineSetter__}}',
      '{{__lookupGetter__}}',
      '{{__proto__}}',
      '{{lookup this "constructor"}}',
      '{{lookup this "__defineGetter__"}}',
      '{{lookup this "__defineSetter__"}}',
      '{{lookup this "__lookupGetter__"}}',
      '{{lookup this "__proto__"}}',
    ];

    templates.forEach(function (template) {
      describe('access should be denied to ' + template, function () {
        it('by default', function () {
          expectTemplate(template).withInput({}).toCompileTo('');
        });
        it(' with proto-access enabled', function () {
          expectTemplate(template)
            .withInput({})
            .withRuntimeOptions({
              allowProtoPropertiesByDefault: true,
              allowProtoMethodsByDefault: true,
            })
            .toCompileTo('');
        });
      });
    });
  });
  describe('GH-1631: disallow access to prototype functions', function () {
    function TestClass() {}

    TestClass.prototype.aProperty = 'propertyValue';
    TestClass.prototype.aMethod = function () {
      return 'returnValue';
    };

    beforeEach(function () {
      handlebarsEnv.resetLoggedPropertyAccesses();
    });

    afterEach(function () {
      sinon.restore();
    });

    describe('control access to prototype methods via "allowedProtoMethods"', function () {
      checkProtoMethodAccess({});

      describe('in compat mode', function () {
        checkProtoMethodAccess({ compat: true });
      });

      function checkProtoMethodAccess(compileOptions) {
        it('should be prohibited by default and log a warning', function () {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .toCompileTo('');

          expect(spy.calledOnce).to.be.true();
          expect(spy.args[0][0]).to.match(/Handlebars: Access has been denied/);
        });

        it('should only log the warning once', function () {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .toCompileTo('');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .toCompileTo('');

          expect(spy.calledOnce).to.be.true();
          expect(spy.args[0][0]).to.match(/Handlebars: Access has been denied/);
        });

        it('can be allowed, which disables the warning', function () {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowedProtoMethods: {
                aMethod: true,
              },
            })
            .toCompileTo('returnValue');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned on by default, which disables the warning', function () {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoMethodsByDefault: true,
            })
            .toCompileTo('returnValue');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned off by default, which disables the warning', function () {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoMethodsByDefault: false,
            })
            .toCompileTo('');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned off, if turned on by default', function () {
          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoMethodsByDefault: true,
              allowedProtoMethods: {
                aMethod: false,
              },
            })
            .toCompileTo('');
        });
      }

      it('should cause the recursive lookup by default (in "compat" mode)', function () {
        expectTemplate('{{#aString}}{{trim}}{{/aString}}')
          .withInput({ aString: '  abc  ', trim: 'trim' })
          .withCompileOptions({ compat: true })
          .toCompileTo('trim');
      });

      it('should not cause the recursive lookup if allowed through options(in "compat" mode)', function () {
        expectTemplate('{{#aString}}{{trim}}{{/aString}}')
          .withInput({ aString: '  abc  ', trim: 'trim' })
          .withCompileOptions({ compat: true })
          .withRuntimeOptions({
            allowedProtoMethods: {
              trim: true,
            },
          })
          .toCompileTo('abc');
      });
    });

    describe('control access to prototype non-methods via "allowedProtoProperties" and "allowProtoPropertiesByDefault', function () {
      checkProtoPropertyAccess({});

      describe('in compat-mode', function () {
        checkProtoPropertyAccess({ compat: true });
      });

      describe('in strict-mode', function () {
        checkProtoPropertyAccess({ strict: true });
      });

      function checkProtoPropertyAccess(compileOptions) {
        it('should be prohibited by default and log a warning', function () {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .toCompileTo('');

          expect(spy.calledOnce).to.be.true();
          expect(spy.args[0][0]).to.match(/Handlebars: Access has been denied/);
        });

        it('can be explicitly prohibited by default, which disables the warning', function () {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoPropertiesByDefault: false,
            })
            .toCompileTo('');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned on, which disables the warning', function () {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowedProtoProperties: {
                aProperty: true,
              },
            })
            .toCompileTo('propertyValue');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned on by default, which disables the warning', function () {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoPropertiesByDefault: true,
            })
            .toCompileTo('propertyValue');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned off, if turned on by default', function () {
          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoPropertiesByDefault: true,
              allowedProtoProperties: {
                aProperty: false,
              },
            })
            .toCompileTo('');
        });
      }
    });

    describe('compatibility with old runtimes, that do not provide the function "container.lookupProperty"', function () {
      beforeEach(function simulateRuntimeWithoutLookupProperty() {
        var oldTemplateMethod = handlebarsEnv.template;
        sinon.replace(handlebarsEnv, 'template', function (templateSpec) {
          templateSpec.main = wrapToAdjustContainer(templateSpec.main);
          return oldTemplateMethod.call(this, templateSpec);
        });
      });

      afterEach(function () {
        sinon.restore();
      });

      it('should work with simple properties', function () {
        expectTemplate('{{aProperty}}')
          .withInput({ aProperty: 'propertyValue' })
          .toCompileTo('propertyValue');
      });

      it('should work with Array.prototype.length', function () {
        expectTemplate('{{anArray.length}}')
          .withInput({ anArray: ['a', 'b', 'c'] })
          .toCompileTo('3');
      });
    });
  });

  describe('escapes template variables', function () {
    it('in compat mode', function () {
      expectTemplate("{{'a\\b'}}")
        .withCompileOptions({ compat: true })
        .withInput({ 'a\\b': 'c' })
        .toCompileTo('c');
    });

    it('in default mode', function () {
      expectTemplate("{{'a\\b'}}")
        .withCompileOptions()
        .withInput({ 'a\\b': 'c' })
        .toCompileTo('c');
    });
    it('in default mode', function () {
      expectTemplate("{{'a\\b'}}")
        .withCompileOptions({ strict: true })
        .withInput({ 'a\\b': 'c' })
        .toCompileTo('c');
    });
  });
});

function wrapToAdjustContainer(precompiledTemplateFunction) {
  return function templateFunctionWrapper(container /*, more args */) {
    delete container.lookupProperty;
    return precompiledTemplateFunction.apply(this, arguments);
  };
}
