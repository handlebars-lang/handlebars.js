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


      it('should allow the "constructor" property to be accessed if it is enumerable', function() {
            shouldCompileTo('{{constructor.name}}', {'constructor': {
                'name': 'here we go'
            }}, 'here we go');
            shouldCompileTo('{{lookup (lookup this "constructor") "name"}}', {'constructor': {
                'name': 'here we go'
            }}, 'here we go');
        });

        it('should allow the "constructor" property to be accessed if it is enumerable', function() {
            shouldCompileTo('{{lookup (lookup this "constructor") "name"}}', {'constructor': {
                    'name': 'here we go'
                }}, 'here we go');
        });


        it('should allow prototype properties that are not constructors', function() {
            function TestClass() {
            }

            Object.defineProperty(TestClass.prototype, 'abc', {
                get: function() {
                    return 'xyz';
                }

            });

            shouldCompileTo('{{#with this as |obj|}}{{obj.abc}}{{/with}}',
                new TestClass(), 'xyz');
            shouldCompileTo('{{#with this as |obj|}}{{lookup obj "abc"}}{{/with}}',
                new TestClass(), 'xyz');

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
                    var template = Handlebars.compile('{{#helperMissing}}{{/helperMissing}}');
                    template({});
                }, Error);
            });
            it('should throw an exception when calling  "{{blockHelperMissing "abc" .}}" ', function() {
                var functionCalls = [];
                expect(function() {
                    var template = Handlebars.compile('{{blockHelperMissing "abc" .}}');
                    template({ fn: function() { functionCalls.push('called'); }});
                }).to.throw(Error);
                expect(functionCalls.length).to.equal(0);
            });
            it('should throw an exception when calling  "{{#blockHelperMissing .}}{{/blockHelperMissing}}"', function() {
                shouldThrow(function() {
                    var template = Handlebars.compile('{{#blockHelperMissing .}}{{/blockHelperMissing}}');
                    template({ fn: function() { return 'functionInData';}});
                }, Error);
            });
        });

        describe('with the option "allowCallsToHelperMissing" set to true', function() {
            it('should not throw an exception when calling  "{{helperMissing}}" ', function() {
                    var template = Handlebars.compile('{{helperMissing}}');
                    template({}, {allowCallsToHelperMissing: true});
            });
            it('should not throw an exception when calling  "{{#helperMissing}}{{/helperMissing}}" ', function() {
                    var template = Handlebars.compile('{{#helperMissing}}{{/helperMissing}}');
                    template({}, {allowCallsToHelperMissing: true});
            });
            it('should not throw an exception when calling  "{{blockHelperMissing "abc" .}}" ', function() {
                    var functionCalls = [];
                    var template = Handlebars.compile('{{blockHelperMissing "abc" .}}');
                    template({ fn: function() { functionCalls.push('called'); }}, {allowCallsToHelperMissing: true});
                    equals(functionCalls.length, 1);
            });
            it('should not throw an exception when calling  "{{#blockHelperMissing .}}{{/blockHelperMissing}}"', function() {
                    var template = Handlebars.compile('{{#blockHelperMissing true}}sdads{{/blockHelperMissing}}');
                    template({}, {allowCallsToHelperMissing: true});
            });
        });
    });

    describe('GH-1563', function() {
        it('should not allow to access constructor after overriding via __defineGetter__', function() {

            shouldThrow(function() {
                compileWithPartials('{{__defineGetter__ "undefined" valueOf }}' +
                    '{{#with __lookupGetter__ }}' +
                    '{{__defineGetter__ "propertyIsEnumerable" (this.bind (this.bind 1)) }}' +
                    '{{constructor.name}}' +
                    '{{/with}}', [{}, {}, {}, {}])({});
                }
            );
        });
    });

    describe('the compile option "allowNonHelperFunctionCall"', function() {
        it('when set to false should prevent calling functions in input objects', function() {
            shouldThrow(function() {
                var template = compileWithPartials('{{test abc}}', [{}, {}, {}, {allowNonHelperFunctionCall: false}]);
                template({test: function() { return 'abc'; }});
            }, null, /Missing helper/);
        });
        it('when set to false should prevent calling functions in input objects (in strict mode)', function() {
            shouldThrow(function() {
                var template = compileWithPartials('{{obj.method abc}}', [{}, {}, {}, {allowNonHelperFunctionCall: false, strict: true}]);
                template({});
            }, null, /Cannot create code.*obj\.method.*Non-helper/);
        });

    });

    describe('Properties that are required to be enumerable', function() {

        it('access should be restricted if not enumerable', function() {
            shouldCompileTo('{{__defineGetter__}}', {}, '');
            shouldCompileTo('{{__defineSetter__}}', {}, '');
            shouldCompileTo('{{__proto__}}', {}, '');
            shouldCompileTo('{{constructor}}', {}, '');
        });

        it('access should be allowed if enumerable', function() {
            shouldCompileTo('{{__defineGetter__}}', {__defineGetter__: 'abc'}, 'abc');
            shouldCompileTo('{{__defineSetter__}}', {__defineSetter__: 'abc'}, 'abc');
            shouldCompileTo('{{constructor}}', {constructor: 'abc'}, 'abc');
        });

        it('access can be allowed via the compile-option "propertyMustBeEnumerable"', function() {
            var context = {};
            ['__defineGetter__', '__defineSetter__'].forEach(function(property) {
                Object.defineProperty(context, property, {
                    get: function() {
                        return property;
                    },
                    enumerable: false
                });
            });

            var compileOptions = {
                propertyMustBeEnumerable: {
                    __defineGetter__: false
                }
            };

            shouldCompileTo('{{__defineGetter__}}{{__defineSetter__}}', [context, {}, {}, compileOptions], '__defineGetter__');
        });
    });
});
