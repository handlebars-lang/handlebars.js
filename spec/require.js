if (typeof(require) !== 'undefined' && require.extensions[".handlebars"]) {
  describe('Require', function() {
    it('Load .handlebars files with require()', function() {
      var template = require("./artifacts/example_1");
      equal(template, require("./artifacts/example_1.handlebars"));

      var expected = 'foo\n';
      var result = template({foo: "foo"});

      equal(result, expected);
    });

    it('Load .hbs files with require()', function() {
      var template = require("./artifacts/example_2");
      equal(template, require("./artifacts/example_2.hbs"));

      var expected = 'Hello, World!\n';
      var result = template({name: "World"});

      equal(result, expected);
    });
  });
}
