/*global Handlebars, shouldCompileTo */

describe('utils', function() {
  describe('#SafeString', function() {
    it("constructing a safestring from a string and checking its type", function() {
      var safe = new Handlebars.SafeString("testing 1, 2, 3");
      if (!(safe instanceof Handlebars.SafeString)) {
        throw new Error('Must be instance of SafeString');
      }
      equals(safe == 'testing 1, 2, 3', true, 'SafeString is equivalent to its underlying string');
    });

    it("it should not escape SafeString properties", function() {
      var name = new Handlebars.SafeString("<em>Sean O&#x27;Malley</em>");

      shouldCompileTo('{{name}}', [{ name: name }], "<em>Sean O&#x27;Malley</em>");
    });
  });

  describe('#escapeExpression', function() {
    it('shouhld escape html', function() {
      equals(Handlebars.Utils.escapeExpression('foo<&"\'>'), 'foo&lt;&amp;&quot;&#x27;&gt;');
    });
    it('should not escape SafeString', function() {
      var string = new Handlebars.SafeString('foo<&"\'>');
      equals(Handlebars.Utils.escapeExpression(string), 'foo<&"\'>');

    });
    it('should handle falsy', function() {
      equals(Handlebars.Utils.escapeExpression(''), '');
      equals(Handlebars.Utils.escapeExpression(undefined), '');
      equals(Handlebars.Utils.escapeExpression(null), '');
      equals(Handlebars.Utils.escapeExpression(false), '');

      equals(Handlebars.Utils.escapeExpression(0), '0');
    });
    it('should handle empty objects', function() {
      equals(Handlebars.Utils.escapeExpression({}), {}.toString());
      equals(Handlebars.Utils.escapeExpression([]), [].toString());
    });
  });

  describe('#isEmpty', function() {
    it('should not be empty', function() {
      equals(Handlebars.Utils.isEmpty(undefined), true);
      equals(Handlebars.Utils.isEmpty(null), true);
      equals(Handlebars.Utils.isEmpty(false), true);
      equals(Handlebars.Utils.isEmpty(''), true);
      equals(Handlebars.Utils.isEmpty([]), true);
    });

    it('should be empty', function() {
      equals(Handlebars.Utils.isEmpty(0), false);
      equals(Handlebars.Utils.isEmpty([1]), false);
      equals(Handlebars.Utils.isEmpty('foo'), false);
      equals(Handlebars.Utils.isEmpty({bar: 1}), false);
    });
  });
});
