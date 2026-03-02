describe('utils', function () {
  describe('#SafeString', function () {
    it('constructing a safestring from a string and checking its type', function () {
      var safe = new Handlebars.SafeString('testing 1, 2, 3');
      if (!(safe instanceof Handlebars.SafeString)) {
        throw new Error('Must be instance of SafeString');
      }
      expect(safe.toString()).toBe('testing 1, 2, 3');
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
      expect(Handlebars.Utils.escapeExpression('foo<&"\'>')).toBe(
        'foo&lt;&amp;&quot;&#x27;&gt;'
      );
      expect(Handlebars.Utils.escapeExpression('foo=')).toBe('foo&#x3D;');
    });
    it('should not escape SafeString', function () {
      var string = new Handlebars.SafeString('foo<&"\'>');
      expect(Handlebars.Utils.escapeExpression(string)).toBe('foo<&"\'>');

      var obj = {
        toHTML: function () {
          return 'foo<&"\'>';
        },
      };
      expect(Handlebars.Utils.escapeExpression(obj)).toBe('foo<&"\'>');
    });
    it('should handle falsy', function () {
      expect(Handlebars.Utils.escapeExpression('')).toBe('');
      expect(Handlebars.Utils.escapeExpression(undefined)).toBe('');
      expect(Handlebars.Utils.escapeExpression(null)).toBe('');

      expect(Handlebars.Utils.escapeExpression(false)).toBe('false');
      expect(Handlebars.Utils.escapeExpression(0)).toBe('0');
    });
    it('should handle empty objects', function () {
      expect(Handlebars.Utils.escapeExpression({})).toBe({}.toString());
      expect(Handlebars.Utils.escapeExpression([])).toBe([].toString());
    });
  });

  describe('#isEmpty', function () {
    it('should not be empty', function () {
      expect(Handlebars.Utils.isEmpty(undefined)).toBe(true);
      expect(Handlebars.Utils.isEmpty(null)).toBe(true);
      expect(Handlebars.Utils.isEmpty(false)).toBe(true);
      expect(Handlebars.Utils.isEmpty('')).toBe(true);
      expect(Handlebars.Utils.isEmpty([])).toBe(true);
    });

    it('should be empty', function () {
      expect(Handlebars.Utils.isEmpty(0)).toBe(false);
      expect(Handlebars.Utils.isEmpty([1])).toBe(false);
      expect(Handlebars.Utils.isEmpty('foo')).toBe(false);
      expect(Handlebars.Utils.isEmpty({ bar: 1 })).toBe(false);
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

      expect(b.a).toBe(1);
      expect(b.b).toBe(2);
    });
  });

  describe('#isType', function () {
    it('should check if variable is type Array', function () {
      expect(Handlebars.Utils.isArray('string')).toBe(false);
      expect(Handlebars.Utils.isArray([])).toBe(true);
    });

    it('should check if variable is type Map', function () {
      expect(Handlebars.Utils.isMap('string')).toBe(false);
      expect(Handlebars.Utils.isMap(new Map())).toBe(true);
    });

    it('should check if variable is type Set', function () {
      expect(Handlebars.Utils.isSet('string')).toBe(false);
      expect(Handlebars.Utils.isSet(new Set())).toBe(true);
    });
  });
});
