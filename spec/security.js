describe('security issues', function() {

    it('should not allow constructors to be accessed', function() {
        shouldCompileTo('{{#with this as |obj|}}{{obj.constructor.name}}{{/with}}', {}, '');
    });

    it('should allow the "constructor" property to be accessed if it is enumerable', function() {
        shouldCompileTo('{{constructor.name}}', {'constructor': {
            'name': 'here we go'
        }}, 'here we go');
    });

    it('should allow prototype properties that are not constructors', function() {
        class TestClass {
            get abc() {
                return 'xyz';
            }
        }
        shouldCompileTo('{{#with this as |obj|}}{{obj.abc}}{{/with}}',
            new TestClass(), 'xyz');
    });
});
