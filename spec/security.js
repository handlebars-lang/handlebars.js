describe('security issues', function() {
  describe('GH-1495: Prevent Remote Code Execution via constructor', function() {
    it('should not allow constructors to be accessed', function() {
      expectTemplate('{{lookup (lookup this "constructor") "name"}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{constructor.name}}')
        .withInput({})
        .toCompileTo('');
    });

    it('GH-1603: should not allow constructors to be accessed (lookup via toString)', function() {
      expectTemplate('{{lookup (lookup this (list "constructor")) "name"}}')
        .withInput({})
        .withHelper('list', function(element) {
          return [element];
        })
        .toCompileTo('');
    });

    it('should allow the "constructor" property to be accessed if it is an "ownProperty"', function() {
      shouldCompileTo(
        '{{constructor.name}}',
        {
          constructor: {
            name: 'here we go'
          }
        },
        'here we go'
      );
      shouldCompileTo(
        '{{lookup (lookup this "constructor") "name"}}',
        {
          constructor: {
            name: 'here we go'
          }
        },
        'here we go'
      );
    });

    it('should allow the "constructor" property to be accessed if it is an "own property"', function() {
      shouldCompileTo(
        '{{lookup (lookup this "constructor") "name"}}',
        {
          constructor: {
            name: 'here we go'
          }
        },
        'here we go'
      );
    });
  });

  describe('GH-1558: Prevent explicit call of helperMissing-helpers', function() {
    if (!Handlebars.compile) {
      return;
    }

    describe('without the option "allowExplicitCallOfHelperMissing"', function() {
      it('should throw an exception when calling  "{{helperMissing}}" ', function() {
        shouldThrow(function() {
          var template = Handlebars.compile('{{helperMissing}}');
          template({});
        }, Error);
      });
      it('should throw an exception when calling  "{{#helperMissing}}{{/helperMissing}}" ', function() {
        shouldThrow(function() {
          var template = Handlebars.compile(
            '{{#helperMissing}}{{/helperMissing}}'
          );
          template({});
        }, Error);
      });
      it('should throw an exception when calling  "{{blockHelperMissing "abc" .}}" ', function() {
        var functionCalls = [];
        expect(function() {
          var template = Handlebars.compile('{{blockHelperMissing "abc" .}}');
          template({
            fn: function() {
              functionCalls.push('called');
            }
          });
        }).to.throw(Error);
        expect(functionCalls.length).to.equal(0);
      });
      it('should throw an exception when calling  "{{#blockHelperMissing .}}{{/blockHelperMissing}}"', function() {
        shouldThrow(function() {
          var template = Handlebars.compile(
            '{{#blockHelperMissing .}}{{/blockHelperMissing}}'
          );
          template({
            fn: function() {
              return 'functionInData';
            }
          });
        }, Error);
      });
    });

    describe('with the option "allowCallsToHelperMissing" set to true', function() {
      it('should not throw an exception when calling  "{{helperMissing}}" ', function() {
        var template = Handlebars.compile('{{helperMissing}}');
        template({}, { allowCallsToHelperMissing: true });
      });
      it('should not throw an exception when calling  "{{#helperMissing}}{{/helperMissing}}" ', function() {
        var template = Handlebars.compile(
          '{{#helperMissing}}{{/helperMissing}}'
        );
        template({}, { allowCallsToHelperMissing: true });
      });
      it('should not throw an exception when calling  "{{blockHelperMissing "abc" .}}" ', function() {
        var functionCalls = [];
        var template = Handlebars.compile('{{blockHelperMissing "abc" .}}');
        template(
          {
            fn: function() {
              functionCalls.push('called');
            }
          },
          { allowCallsToHelperMissing: true }
        );
        equals(functionCalls.length, 1);
      });
      it('should not throw an exception when calling  "{{#blockHelperMissing .}}{{/blockHelperMissing}}"', function() {
        var template = Handlebars.compile(
          '{{#blockHelperMissing true}}sdads{{/blockHelperMissing}}'
        );
        template({}, { allowCallsToHelperMissing: true });
      });
    });
  });

  describe('GH-1563', function() {
    it('should not allow to access constructor after overriding via __defineGetter__', function() {
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

  describe('GH-1595', function() {
    it('properties, that are required to be own properties', function() {
      expectTemplate('{{constructor}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{__defineGetter__}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{__defineSetter__}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{__lookupGetter__}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{__proto__}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{lookup this "constructor"}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{lookup this "__defineGetter__"}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{lookup this "__defineSetter__"}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{lookup this "__lookupGetter__"}}')
        .withInput({})
        .toCompileTo('');

      expectTemplate('{{lookup this "__proto__"}}')
        .withInput({})
        .toCompileTo('');
    });

    describe('GH-1631: disallow access to prototype functions', function() {
      function TestClass() {}

      TestClass.prototype.aProperty = 'propertyValue';
      TestClass.prototype.aMethod = function() {
        return 'returnValue';
      };

      describe('control access to prototype methods via "allowedProtoMethods"', function() {
        it('should be prohibited by default', function() {
          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .toCompileTo('');
        });

        it('can be allowed', function() {
          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withRuntimeOptions({
              allowedProtoMethods: {
                aMethod: true
              }
            })
            .toCompileTo('returnValue');
        });

        it('should be prohibited by default (in "compat" mode)', function() {
          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions({ compat: true })
            .toCompileTo('');
        });

        it('can be allowed (in "compat" mode)', function() {
          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions({ compat: true })
            .withRuntimeOptions({
              allowedProtoMethods: {
                aMethod: true
              }
            })
            .toCompileTo('returnValue');
        });

        it('should cause the recursive lookup by default (in "compat" mode)', function() {
          expectTemplate('{{#aString}}{{trim}}{{/aString}}')
            .withInput({ aString: '  abc  ', trim: 'trim' })
            .withCompileOptions({ compat: true })
            .toCompileTo('trim');
        });

        it('should not cause the recursive lookup if allowed through options(in "compat" mode)', function() {
          expectTemplate('{{#aString}}{{trim}}{{/aString}}')
            .withInput({ aString: '  abc  ', trim: 'trim' })
            .withCompileOptions({ compat: true })
            .withRuntimeOptions({
              allowedProtoMethods: {
                trim: true
              }
            })
            .toCompileTo('abc');
        });
      });

      describe('control access to prototype non-methods via "allowedProtoProperties"', function() {
        it('should be prohibited by default', function() {
          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .toCompileTo('');
        });

        it('can be turned on', function() {
          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withRuntimeOptions({
              allowedProtoProperties: {
                aProperty: true
              }
            })
            .toCompileTo('propertyValue');
        });

        it('should be prohibited by default (in "compat" mode)', function() {
          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions({ compat: true })
            .toCompileTo('');
        });

        it('can be turned on (in "compat" mode)', function() {
          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions({ compat: true })
            .withRuntimeOptions({
              allowedProtoProperties: {
                aProperty: true
              }
            })
            .toCompileTo('propertyValue');
        });
      });

      describe('compatibility with old runtimes, that do not provide the function "container.lookupProperty"', function() {
        beforeEach(function simulateRuntimeWithoutLookupProperty() {
          var oldTemplateMethod = handlebarsEnv.template;
          sinon.replace(handlebarsEnv, 'template', function(templateSpec) {
            templateSpec.main = wrapToAdjustContainer(templateSpec.main);
            return oldTemplateMethod.call(this, templateSpec);
          });
        });

        afterEach(function() {
          sinon.restore();
        });

        it('should work with simple properties', function() {
          expectTemplate('{{aProperty}}')
            .withInput({ aProperty: 'propertyValue' })
            .toCompileTo('propertyValue');
        });

        it('should work with Array.prototype.length', function() {
          expectTemplate('{{anArray.length}}')
            .withInput({ anArray: ['a', 'b', 'c'] })
            .toCompileTo('3');
        });
      });
    });
  });
});

function wrapToAdjustContainer(precompiledTemplateFunction) {
  return function templateFunctionWrapper(container /*, more args */) {
    delete container.lookupProperty;
    return precompiledTemplateFunction.apply(this, arguments);
  };
}
