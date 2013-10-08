import SafeString from "handlebars/safe-string";
import { isEmpty, escapeExpression } from "handlebars/utils";

describe('utils', function() {
  describe('#SafeString', function() {
    it("constructing a safestring from a string and checking its type", function() {
      var safe = new SafeString("testing 1, 2, 3");
      safe.should.be.instanceof(SafeString);
      (safe == "testing 1, 2, 3").should.equal(true, "SafeString is equivalent to its underlying string");
    });

    it("it should not escape SafeString properties", function() {
      var name = new SafeString("<em>Sean O&#x27;Malley</em>");

      shouldCompileTo('{{name}}', [{ name: name }], "<em>Sean O&#x27;Malley</em>");
    });
  });

  describe('#escapeExpression', function() {
    it('shouhld escape html', function() {
      escapeExpression('foo<&"\'>').should.equal('foo&lt;&amp;&quot;&#x27;&gt;');
    });
    it('should not escape SafeString', function() {
      var string = new SafeString('foo<&"\'>');
      escapeExpression(string).should.equal('foo<&"\'>');

    });
    it('should handle falsy', function() {
      escapeExpression('').should.equal('');
      escapeExpression(undefined).should.equal('');
      escapeExpression(null).should.equal('');
      escapeExpression(false).should.equal('');

      escapeExpression(0).should.equal('0');
    });
    it('should handle empty objects', function() {
      escapeExpression({}).should.equal({}.toString());
      escapeExpression([]).should.equal([].toString());
    });
  });

  describe('#isEmpty', function() {
    it('should not be empty', function() {
      isEmpty(undefined).should.equal(true);
      isEmpty(null).should.equal(true);
      isEmpty(false).should.equal(true);
      isEmpty('').should.equal(true);
      isEmpty([]).should.equal(true);
    });

    it('should be empty', function() {
      isEmpty(0).should.equal(false);
      isEmpty([1]).should.equal(false);
      isEmpty('foo').should.equal(false);
      isEmpty({bar: 1}).should.equal(false);
    });
  });
});
