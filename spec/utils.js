/*global shouldCompileTo */
describe('utils', function() {
  describe('#SafeString', function() {
    it("constructing a safestring from a string and checking its type", function() {
      var safe = new Handlebars.SafeString("testing 1, 2, 3");
      safe.should.be.instanceof(Handlebars.SafeString);
      (safe == "testing 1, 2, 3").should.equal(true, "SafeString is equivalent to its underlying string");
    });

    it("it should not escape SafeString properties", function() {
      var name = new Handlebars.SafeString("<em>Sean O&#x27;Malley</em>");

      shouldCompileTo('{{name}}', [{ name: name }], "<em>Sean O&#x27;Malley</em>");
    });
  });

  describe('#escapeExpression', function() {
    it('shouhld escape html', function() {
      Handlebars.Utils.escapeExpression('foo<&"\'>').should.equal('foo&lt;&amp;&quot;&#x27;&gt;');
    });
    it('should not escape SafeString', function() {
      var string = new Handlebars.SafeString('foo<&"\'>');
      Handlebars.Utils.escapeExpression(string).should.equal('foo<&"\'>');

    });
    it('should handle falsy', function() {
      Handlebars.Utils.escapeExpression('').should.equal('');
      Handlebars.Utils.escapeExpression(undefined).should.equal('');
      Handlebars.Utils.escapeExpression(null).should.equal('');
      Handlebars.Utils.escapeExpression(false).should.equal('');

      Handlebars.Utils.escapeExpression(0).should.equal('0');
    });
    it('should handle empty objects', function() {
      Handlebars.Utils.escapeExpression({}).should.equal({}.toString());
      Handlebars.Utils.escapeExpression([]).should.equal([].toString());
    });
  });

  describe('#isEmpty', function() {
    it('should not be empty', function() {
      Handlebars.Utils.isEmpty(undefined).should.equal(true);
      Handlebars.Utils.isEmpty(null).should.equal(true);
      Handlebars.Utils.isEmpty(false).should.equal(true);
      Handlebars.Utils.isEmpty('').should.equal(true);
      Handlebars.Utils.isEmpty([]).should.equal(true);
    });

    it('should be empty', function() {
      Handlebars.Utils.isEmpty(0).should.equal(false);
      Handlebars.Utils.isEmpty([1]).should.equal(false);
      Handlebars.Utils.isEmpty('foo').should.equal(false);
      Handlebars.Utils.isEmpty({bar: 1}).should.equal(false);
    });
  });
});
