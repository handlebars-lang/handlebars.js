describe('utils', function () {
  describe('#SafeString', function () {
    it('constructing a safestring from a string and checking its type', function () {
      var safe = new Handlebars.SafeString('testing 1, 2, 3');
      if (!(safe instanceof Handlebars.SafeString)) {
        throw new Error('Must be instance of SafeString');
      }
      equals(
        safe.toString(),
        'testing 1, 2, 3',
        'SafeString is equivalent to its underlying string'
      );
    });

    it('it should not escape SafeString properties', function () {
      var name = new Handlebars.SafeString('<em>Sean O&#x27;Malley</em>');

      expectTemplate('{{name}}')
        .withInput({ name: name })
        .toCompileTo('<em>Sean O&#x27;Malley</em>');
    });
  });

  describe('#escapeExpression', function () {
    it('should escape html', function () {
      equals(
        Handlebars.Utils.escapeExpression('foo<&"\'>'),
        'foo&lt;&amp;&quot;&#x27;&gt;'
      );
      equals(Handlebars.Utils.escapeExpression('foo='), 'foo&#x3D;');
    });
    it('should not escape SafeString', function () {
      var string = new Handlebars.SafeString('foo<&"\'>');
      equals(Handlebars.Utils.escapeExpression(string), 'foo<&"\'>');

      var obj = {
        toHTML: function () {
          return 'foo<&"\'>';
        },
      };
      equals(Handlebars.Utils.escapeExpression(obj), 'foo<&"\'>');
    });
    it('should handle falsy', function () {
      equals(Handlebars.Utils.escapeExpression(''), '');
      equals(Handlebars.Utils.escapeExpression(undefined), '');
      equals(Handlebars.Utils.escapeExpression(null), '');

      equals(Handlebars.Utils.escapeExpression(false), 'false');
      equals(Handlebars.Utils.escapeExpression(0), '0');
    });
    it('should handle empty objects', function () {
      equals(Handlebars.Utils.escapeExpression({}), {}.toString());
      equals(Handlebars.Utils.escapeExpression([]), [].toString());
    });
  });

  describe('#isEmpty', function () {
    it('should not be empty', function () {
      equals(Handlebars.Utils.isEmpty(undefined), true);
      equals(Handlebars.Utils.isEmpty(null), true);
      equals(Handlebars.Utils.isEmpty(false), true);
      equals(Handlebars.Utils.isEmpty(''), true);
      equals(Handlebars.Utils.isEmpty([]), true);
    });

    it('should be empty', function () {
      equals(Handlebars.Utils.isEmpty(0), false);
      equals(Handlebars.Utils.isEmpty([1]), false);
      equals(Handlebars.Utils.isEmpty('foo'), false);
      equals(Handlebars.Utils.isEmpty({ bar: 1 }), false);
    });
  });

  describe('#extend', function () {
    it('should ignore prototype values', function () {
      function A() {
        this.a = 1;
      }
      A.prototype.b = 4;

      var b = { b: 2 };

      Handlebars.Utils.extend(b, new A());

      equals(b.a, 1);
      equals(b.b, 2);
    });
  });

  describe('#isType', function () {
    it('should check if variable is type Array', function () {
      expect(Handlebars.Utils.isArray('string')).to.equal(false);
      expect(Handlebars.Utils.isArray([])).to.equal(true);
    });

    it('should check if variable is type Map', function () {
      expect(Handlebars.Utils.isMap('string')).to.equal(false);
      expect(Handlebars.Utils.isMap(new Map())).to.equal(true);
    });

    it('should check if variable is type Set', function () {
      expect(Handlebars.Utils.isSet('string')).to.equal(false);
      expect(Handlebars.Utils.isSet(new Set())).to.equal(true);
    });
  });
});
