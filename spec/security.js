describe('security issues', function() {
    describe('GH-1495: Prevent Remote Code Execution via constructor', function() {
        it('should not allow constructors to be accessed', function() {
            shouldCompileTo('{{constructor.name}}', {}, '');
            shouldCompileTo('{{lookup (lookup this "constructor") "name"}}', {}, '');
        });

        it('should allow the "constructor" property to be accessed if it is enumerable', function() {
            shouldCompileTo('{{constructor.name}}', {'constructor': {
                'name': 'here we go'
            }}, 'here we go');
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
                shouldThrow(function() {
                    var template = Handlebars.compile('{{blockHelperMissing "abc" .}}');
                    template({ fn: function() { functionCalls.push('called'); }});
                }, Error);
                equals(functionCalls.length, 0);
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
            if (({}).__defineGetter__ == null || ({}).__lookupGetter__ == null) {
                return; // Browser does not support this exploit anyway
            }
            shouldCompileTo('{{__defineGetter__ "undefined" valueOf }}' +
                '{{#with __lookupGetter__ }}' +
                '{{__defineGetter__ "propertyIsEnumerable" (this.bind (this.bind 1)) }}' +
                '{{constructor.name}}' +
                '{{/with}}', {}, '');
        });
    });
});
