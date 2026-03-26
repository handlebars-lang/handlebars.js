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
      expectTemplate('{{constructor.name}}')
        .withInput({ constructor: { name: 'here we go' } })
        .toCompileTo('here we go');

      expectTemplate('{{lookup (lookup this "constructor") "name"}}')
        .withInput({ constructor: { name: 'here we go' } })
        .toCompileTo('here we go');
    });

    it('should allow the "constructor" property to be accessed if it is an "own property"', function() {
      expectTemplate('{{lookup (lookup this "constructor") "name"}}')
        .withInput({ constructor: { name: 'here we go' } })
        .toCompileTo('here we go');
    });
  });

  describe('GH-1558: Prevent explicit call of helperMissing-helpers', function() {
    if (!Handlebars.compile) {
      return;
    }

    describe('without the option "allowExplicitCallOfHelperMissing"', function() {
      it('should throw an exception when calling  "{{helperMissing}}" ', function() {
        expectTemplate('{{helperMissing}}').toThrow(Error);
      });

      it('should throw an exception when calling  "{{#helperMissing}}{{/helperMissing}}" ', function() {
        expectTemplate('{{#helperMissing}}{{/helperMissing}}').toThrow(Error);
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
        expectTemplate('{{#blockHelperMissing .}}{{/blockHelperMissing}}')
          .withInput({
            fn: function() {
              return 'functionInData';
            }
          })
          .toThrow(Error);
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

  describe('GH-1595: dangerous properties', function() {
    var templates = [
      '{{constructor}}',
      '{{__defineGetter__}}',
      '{{__defineSetter__}}',
      '{{__lookupGetter__}}',
      '{{__lookupSetter__}}',
      '{{__proto__}}',
      '{{lookup this "constructor"}}',
      '{{lookup this "__defineGetter__"}}',
      '{{lookup this "__defineSetter__"}}',
      '{{lookup this "__lookupGetter__"}}',
      '{{lookup this "__lookupSetter__"}}',
      '{{lookup this "__proto__"}}'
    ];

    templates.forEach(function(template) {
      describe('access should be denied to ' + template, function() {
        it('by default', function() {
          expectTemplate(template)
            .withInput({})
            .toCompileTo('');
        });
        it(' with proto-access enabled', function() {
          expectTemplate(template)
            .withInput({})
            .withRuntimeOptions({
              allowProtoPropertiesByDefault: true,
              allowProtoMethodsByDefault: true
            })
            .toCompileTo('');
        });
      });
    });
  });
  describe('GH-1631: disallow access to prototype functions', function() {
    function TestClass() {}

    TestClass.prototype.aProperty = 'propertyValue';
    TestClass.prototype.aMethod = function() {
      return 'returnValue';
    };

    beforeEach(function() {
      handlebarsEnv.resetLoggedPropertyAccesses();
    });

    afterEach(function() {
      sinon.restore();
    });

    describe('control access to prototype methods via "allowedProtoMethods"', function() {
      checkProtoMethodAccess({});

      describe('in compat mode', function() {
        checkProtoMethodAccess({ compat: true });
      });

      function checkProtoMethodAccess(compileOptions) {
        it('should be prohibited by default and log a warning', function() {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .toCompileTo('');

          expect(spy.calledOnce).to.be.true();
          expect(spy.args[0][0]).to.match(/Handlebars: Access has been denied/);
        });

        it('should only log the warning once', function() {
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

        it('can be allowed, which disables the warning', function() {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowedProtoMethods: {
                aMethod: true
              }
            })
            .toCompileTo('returnValue');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned on by default, which disables the warning', function() {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoMethodsByDefault: true
            })
            .toCompileTo('returnValue');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned off by default, which disables the warning', function() {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoMethodsByDefault: false
            })
            .toCompileTo('');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned off, if turned on by default', function() {
          expectTemplate('{{aMethod}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoMethodsByDefault: true,
              allowedProtoMethods: {
                aMethod: false
              }
            })
            .toCompileTo('');
        });
      }

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

    describe('control access to prototype non-methods via "allowedProtoProperties" and "allowProtoPropertiesByDefault', function() {
      checkProtoPropertyAccess({});

      describe('in compat-mode', function() {
        checkProtoPropertyAccess({ compat: true });
      });

      describe('in strict-mode', function() {
        checkProtoPropertyAccess({ strict: true });
      });

      function checkProtoPropertyAccess(compileOptions) {
        it('should be prohibited by default and log a warning', function() {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .toCompileTo('');

          expect(spy.calledOnce).to.be.true();
          expect(spy.args[0][0]).to.match(/Handlebars: Access has been denied/);
        });

        it('can be explicitly prohibited by default, which disables the warning', function() {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoPropertiesByDefault: false
            })
            .toCompileTo('');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned on, which disables the warning', function() {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowedProtoProperties: {
                aProperty: true
              }
            })
            .toCompileTo('propertyValue');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned on by default, which disables the warning', function() {
          var spy = sinon.spy(console, 'error');

          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoPropertiesByDefault: true
            })
            .toCompileTo('propertyValue');

          expect(spy.callCount).to.equal(0);
        });

        it('can be turned off, if turned on by default', function() {
          expectTemplate('{{aProperty}}')
            .withInput(new TestClass())
            .withCompileOptions(compileOptions)
            .withRuntimeOptions({
              allowProtoPropertiesByDefault: true,
              allowedProtoProperties: {
                aProperty: false
              }
            })
            .toCompileTo('');
        });
      }
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

  describe('GHSA-2qvq-rjwj-gvw9: partial resolution must not use polluted prototypes', function() {
    if (!Handlebars.compile) {
      return;
    }

    afterEach(function() {
      delete Object.prototype.widget;
    });

    it('should not resolve partial names from Object.prototype', function() {
      // eslint-disable-next-line no-extend-native
      Object.prototype.widget = '<img src=x onerror="alert(1)">';

      expect(function() {
        Handlebars.compile('<div>{{> widget}}</div>')({});
      }).to.throw(/could not be found/);
    });
  });

  describe('GHSA-2w6w-674q-4c4q, GHSA-xhpv-hc6g-r9c6, GHSA-3mfm-83xf-c92r, GHSA-8r5x-fm3f-whwj: untrusted AST inputs', function() {
    if (!Handlebars.compile) {
      return;
    }

    function createInjectedProgram() {
      var loc = {
        source: null,
        start: { line: 1, column: 0 },
        end: { line: 1, column: 20 }
      };
      return {
        type: 'Program',
        body: [
          {
            type: 'MustacheStatement',
            escaped: true,
            strip: {
              open: false,
              close: false
            },
            loc: loc,
            path: {
              type: 'PathExpression',
              data: false,
              depth: 0,
              parts: ['lookup'],
              original: 'lookup',
              loc: loc
            },
            params: [
              {
                type: 'PathExpression',
                data: false,
                depth: 0,
                parts: [],
                original: 'this',
                loc: loc
              },
              {
                type: 'NumberLiteral',
                value: '{},{})) + (Function) + (({}',
                original: 1,
                loc: loc
              }
            ]
          }
        ]
      };
    }

    it('should reject AST NumberLiteral type confusion in compile()', function() {
      // NumberLiteral.value is emitted as a raw JavaScript literal, so the
      // compiler rejects anything that is not a number.
      expect(function() {
        var template = Handlebars.compile(createInjectedProgram());
        template({});
      }).to.throw(/Invalid AST: NumberLiteral value must be a number/);
    });

    it('should reject AST objects passed via dynamic partial lookup', function() {
      expect(function() {
        var template = Handlebars.compile('{{> (lookup . "payload")}}');
        template({
          payload: createInjectedProgram()
        });
      }).to.throw(/could not be found/);
    });

    it('should reject a non-integer param depth in stringParams mode', function() {
      // pushParam passes val.depth to the getContext opcode. In stringParams
      // mode, getContext stores the depth in lastContext, which contextName
      // interpolates into generated code as 'depths[' + depth + ']'. A depth
      // that is not a non-negative integer is therefore rejected.
      var loc = {
        source: null,
        start: { line: 1, column: 0 },
        end: { line: 1, column: 20 }
      };
      var maliciousAST = {
        type: 'Program',
        body: [
          {
            type: 'MustacheStatement',
            escaped: true,
            strip: { open: false, close: false },
            loc: loc,
            path: {
              type: 'PathExpression',
              data: false,
              depth: 0,
              parts: ['lookup'],
              original: 'lookup',
              loc: loc
            },
            params: [
              {
                type: 'PathExpression',
                data: false,
                depth: 'function(){throw new Error("INJECTION")}()',
                parts: [],
                original: '',
                loc: loc
              }
            ]
          }
        ]
      };

      expect(function() {
        var template = Handlebars.compile(maliciousAST, {
          stringParams: true
        });
        template({});
      }).to.throw(
        /Invalid AST: PathExpression depth must be a non-negative integer/
      );
    });

    it('should reject non-array blockParams', function() {
      // The compiler reads program.blockParams.length from the AST and
      // javascript-compiler.js interpolates that value verbatim into a
      // container.program(...) call. blockParams must therefore be an array
      // of strings, so that the length is always a safe integer.
      var maliciousAST = {
        type: 'Program',
        loc: { start: { line: 1, column: 0 } },
        body: [
          {
            type: 'BlockStatement',
            path: {
              type: 'PathExpression',
              data: false,
              depth: 0,
              parts: ['rce'],
              original: 'rce',
              loc: { start: { line: 1, column: 0 } }
            },
            params: [],
            program: {
              type: 'Program',
              blockParams: {
                length: "(()=>{throw new Error('INJECTION')})()"
              },
              body: [],
              loc: { start: { line: 1, column: 0 } }
            },
            openStrip: { open: false, close: false },
            inverseStrip: { open: false, close: false },
            closeStrip: { open: false, close: false },
            loc: { start: { line: 1, column: 0 } }
          }
        ]
      };

      expect(function() {
        var template = Handlebars.compile(maliciousAST, {
          stringParams: true
        });
        template({});
      }).to.throw(/Invalid AST: Program blockParams must be an array/);
    });

    it('should reject non-number NumberLiteral values in stringParams mode', function() {
      // In stringParams mode, pushStringParam emits any non-string param
      // value as a raw literal, and the code generator concatenates array
      // chunks verbatim. The NumberLiteral handler therefore rejects any
      // value that is not a number.
      var loc = {
        source: null,
        start: { line: 1, column: 0 },
        end: { line: 1, column: 20 }
      };
      var maliciousAST = {
        type: 'Program',
        body: [
          {
            type: 'MustacheStatement',
            escaped: true,
            strip: { open: false, close: false },
            loc: loc,
            path: {
              type: 'PathExpression',
              data: false,
              depth: 0,
              parts: ['helper'],
              original: 'helper',
              loc: loc
            },
            params: [
              {
                type: 'NumberLiteral',
                value: ['(function(){throw new Error("INJECTION")})()'],
                original: 1,
                loc: loc
              }
            ]
          }
        ]
      };

      expect(function() {
        var template = Handlebars.compile(maliciousAST, {
          stringParams: true
        });
        template({});
      }).to.throw(/Invalid AST: NumberLiteral value must be a number/);
    });

    it('should only dispatch known AST node types', function() {
      // Compiler#accept() dispatches on node.type. Without an allowlist, a
      // crafted type would call an arbitrary Compiler method with the node as
      // its argument. Params are used because WhitespaceControl does not
      // visit them, so they reach the compiler unchecked.
      var loc = {
        source: null,
        start: { line: 1, column: 0 },
        end: { line: 1, column: 20 }
      };
      [
        'compile',
        'opcode',
        'pushParam',
        'constructor',
        'hasOwnProperty',
        '__proto__'
      ].forEach(function(type) {
        var template = Handlebars.compile({
          type: 'Program',
          body: [
            {
              type: 'MustacheStatement',
              escaped: true,
              strip: { open: false, close: false },
              loc: loc,
              path: {
                type: 'PathExpression',
                data: false,
                depth: 0,
                parts: ['helper'],
                original: 'helper',
                loc: loc
              },
              params: [{ type: type, loc: loc }]
            }
          ]
        });
        expect(function() {
          template({});
        }).to.throw(/Unknown type: /);
      });
    });

    it('should only dispatch known AST node types when parsing', function() {
      // Visitor#accept() (used by WhitespaceControl before compilation)
      // dispatches on node.type as well. Body statements are visited there,
      // so a crafted type must be rejected instead of calling an arbitrary
      // visitor method such as "accept" (unbounded recursion).
      var loc = {
        source: null,
        start: { line: 1, column: 0 },
        end: { line: 1, column: 20 }
      };
      [
        'accept',
        'acceptKey',
        'acceptArray',
        'acceptRequired',
        'constructor',
        'hasOwnProperty',
        '__proto__'
      ].forEach(function(type) {
        expect(function() {
          Handlebars.parse({
            type: 'Program',
            body: [{ type: type, loc: loc }],
            loc: loc
          });
        }).to.throw(/Unknown type: /);
      });
    });
  });

  describe('GHSA-442j-39wm-28r2: lookup must return checked value', function() {
    it('should use the validated value from lookupProperty() in compat mode', function() {
      var input = { child: {} };
      var readCount = 0;
      Object.defineProperty(input, 'unstable', {
        enumerable: true,
        get: function() {
          readCount++;
          return readCount === 1 ? 'first-read' : 'second-read';
        }
      });

      expectTemplate('{{#with child}}{{unstable}}{{/with}}')
        .withInput(input)
        .withCompileOptions({ compat: true })
        .toCompileTo('first-read');
    });
  });

  describe('GHSA-9cx6-37pm-9jff: malformed decorators should fail safely', function() {
    if (!Handlebars.compile) {
      return;
    }

    it('should throw a controlled error for unknown decorators', function() {
      var template = Handlebars.compile('{{*notRegistered}}');
      expect(function() {
        template({});
      }).to.throw(/Missing decorator|not registered/);
    });
  });

  describe('GHSA-new: @partial-block must not resolve from polluted prototype', function() {
    if (!Handlebars.compile) {
      return;
    }

    afterEach(function() {
      delete Object.prototype['partial-block'];
    });

    it('should not resolve @partial-block from Object.prototype', function() {
      // eslint-disable-next-line no-extend-native
      Object.prototype['partial-block'] = '<img src=x onerror="alert(1)">';

      expect(function() {
        Handlebars.compile('{{> @partial-block}}')({});
      }).to.throw(/could not be found/);
    });

    it('should not resolve @partial-block from Object.prototype inside a partial', function() {
      // eslint-disable-next-line no-extend-native
      Object.prototype['partial-block'] = '<img src=x onerror="alert(1)">';

      Handlebars.registerPartial('testPartial', '{{> @partial-block}}');
      try {
        expect(function() {
          Handlebars.compile('{{> testPartial}}')({});
        }).to.throw(/could not be found/);
      } finally {
        Handlebars.unregisterPartial('testPartial');
      }
    });

    it('should still render legitimate @partial-block content', function() {
      Handlebars.registerPartial('wrapper', '<div>{{> @partial-block}}</div>');
      try {
        var result = Handlebars.compile('{{#> wrapper}}hello{{/wrapper}}')({});
        expect(result).to.equal('<div>hello</div>');
      } finally {
        Handlebars.unregisterPartial('wrapper');
      }
    });
  });
});

function wrapToAdjustContainer(precompiledTemplateFunction) {
  return function templateFunctionWrapper(container /*, more args */) {
    delete container.lookupProperty;
    return precompiledTemplateFunction.apply(this, arguments);
  };
}
