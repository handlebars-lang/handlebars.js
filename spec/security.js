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

            shouldCompileTo('{{#with this}}{{this.abc}}{{/with}}',
                new TestClass(), 'xyz');
            shouldCompileTo('{{#with this}}{{lookup this "abc"}}{{/with}}',
                new TestClass(), 'xyz');
        });
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
});
