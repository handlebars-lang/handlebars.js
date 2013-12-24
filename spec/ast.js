/*global Handlebars, handlebarsEnv, shouldThrow */
describe('ast', function() {
  if (!Handlebars.AST) {
    return;
  }

  describe('MustacheNode', function() {
    function testEscape(open, expected) {
      var mustache = new handlebarsEnv.AST.MustacheNode([{}], {}, open, false);
      equals(mustache.escaped, expected);
    }

    it('should store args', function() {
      var id = {isSimple: true},
          hash = {},
          mustache = new handlebarsEnv.AST.MustacheNode([id, 'param1'], hash, '', false);
      equals(mustache.type, 'mustache');
      equals(mustache.hash, hash);
      equals(mustache.escaped, true);
      equals(mustache.id, id);
      equals(mustache.params.length, 1);
      equals(mustache.params[0], 'param1');
      equals(!!mustache.isHelper, true);
    });
    it('should accept token for escape', function() {
      testEscape('{{', true);
      testEscape('{{~', true);
      testEscape('{{#', true);
      testEscape('{{~#', true);
      testEscape('{{/', true);
      testEscape('{{~/', true);
      testEscape('{{^', true);
      testEscape('{{~^', true);
      testEscape('{', true);
      testEscape('{', true);

      testEscape('{{&', false);
      testEscape('{{~&', false);
      testEscape('{{{', false);
      testEscape('{{~{', false);
    });
    it('should accept boolean for escape', function() {
      testEscape(true, true);
      testEscape({}, true);

      testEscape(false, false);
      testEscape(undefined, false);
    });
  });
  describe('BlockNode', function() {
    it('should throw on mustache mismatch', function() {
      shouldThrow(function() {
        new handlebarsEnv.AST.BlockNode({id: {original: 'foo'}}, {}, {}, {path: {original: 'bar'}});
      }, Handlebars.Exception, "foo doesn't match bar");
    });
  });
  describe('IdNode', function() {
    it('should throw on invalid path', function() {
      shouldThrow(function() {
        new handlebarsEnv.AST.IdNode([
          {part: 'foo'},
          {part: '..'},
          {part: 'bar'}
        ]);
      }, Handlebars.Exception, "Invalid path: foo..");
      shouldThrow(function() {
        new handlebarsEnv.AST.IdNode([
          {part: 'foo'},
          {part: '.'},
          {part: 'bar'}
        ]);
      }, Handlebars.Exception, "Invalid path: foo.");
      shouldThrow(function() {
        new handlebarsEnv.AST.IdNode([
          {part: 'foo'},
          {part: 'this'},
          {part: 'bar'}
        ]);
      }, Handlebars.Exception, "Invalid path: foothis");
    });
  });
});
