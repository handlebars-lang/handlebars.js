/*global Handlebars, handlebarsEnv, shouldThrow */
describe('ast', function() {
  if (!Handlebars.AST) {
    return;
  }

  var LOCATION_INFO = {
    last_line: 0,
    first_line: 0,
    first_column: 0,
    last_column: 0
  };

  function testLocationInfoStorage(node){
    var properties = [ 'firstLine', 'lastLine', 'firstColumn', 'lastColumn' ],
        property,
        propertiesLen = properties.length,
        i;

    for (i = 0; i < propertiesLen; i++){
      property = properties[0];
      equals(node[property], 0);
    }
  }

  describe('MustacheNode', function() {
    function testEscape(open, expected) {
      var mustache = new handlebarsEnv.AST.MustacheNode([{}], {}, open, false);
      equals(mustache.escaped, expected);
    }

    it('should store args', function() {
      var id = {isSimple: true},
          hash = {},
          mustache = new handlebarsEnv.AST.MustacheNode([id, 'param1'], hash, '', false, LOCATION_INFO);
      equals(mustache.type, 'mustache');
      equals(mustache.hash, hash);
      equals(mustache.escaped, true);
      equals(mustache.id, id);
      equals(mustache.params.length, 1);
      equals(mustache.params[0], 'param1');
      equals(!!mustache.isHelper, true);
      testLocationInfoStorage(mustache);
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
    it('should throw on mustache mismatch (old sexpr-less version)', function() {
      shouldThrow(function() {
        var mustacheNode = new handlebarsEnv.AST.MustacheNode([{ original: 'foo'}], null, '{{', {});
        new handlebarsEnv.AST.BlockNode(mustacheNode, {}, {}, {path: {original: 'bar'}});
      }, Handlebars.Exception, "foo doesn't match bar");
    });
    it('should throw on mustache mismatch', function() {
      shouldThrow(function() {
        var sexprNode = new handlebarsEnv.AST.SexprNode([{ original: 'foo'}], null);
        var mustacheNode = new handlebarsEnv.AST.MustacheNode(sexprNode, null, '{{', {});
        new handlebarsEnv.AST.BlockNode(mustacheNode, {}, {}, {path: {original: 'bar'}}, {first_line: 2, first_column: 2});
      }, Handlebars.Exception, "foo doesn't match bar - 2:2");
    });

    it('stores location info', function(){
      var sexprNode = new handlebarsEnv.AST.SexprNode([{ original: 'foo'}], null);
      var mustacheNode = new handlebarsEnv.AST.MustacheNode(sexprNode, null, '{{', {});
      var block = new handlebarsEnv.AST.BlockNode(mustacheNode,
                                                  {strip: {}}, {strip: {}},
                                                  {
                                                    strip: {},
                                                    path: {original: 'foo'}
                                                  },
                                                  LOCATION_INFO);
      testLocationInfoStorage(block);
    });
  });
  describe('IdNode', function() {
    it('should throw on invalid path', function() {
      shouldThrow(function() {
        new handlebarsEnv.AST.IdNode([
          {part: 'foo'},
          {part: '..'},
          {part: 'bar'}
        ], {first_line: 1, first_column: 1});
      }, Handlebars.Exception, "Invalid path: foo.. - 1:1");
      shouldThrow(function() {
        new handlebarsEnv.AST.IdNode([
          {part: 'foo'},
          {part: '.'},
          {part: 'bar'}
        ], {first_line: 1, first_column: 1});
      }, Handlebars.Exception, "Invalid path: foo. - 1:1");
      shouldThrow(function() {
        new handlebarsEnv.AST.IdNode([
          {part: 'foo'},
          {part: 'this'},
          {part: 'bar'}
        ], {first_line: 1, first_column: 1});
      }, Handlebars.Exception, "Invalid path: foothis - 1:1");
    });

    it('stores location info', function(){
      var idNode = new handlebarsEnv.AST.IdNode([], LOCATION_INFO);
      testLocationInfoStorage(idNode);
    });
  });

  describe("HashNode", function(){

    it('stores location info', function(){
      var hash = new handlebarsEnv.AST.HashNode([], LOCATION_INFO);
      testLocationInfoStorage(hash);
    });
  });

  describe("ContentNode", function(){

    it('stores location info', function(){
      var content = new handlebarsEnv.AST.ContentNode("HI", LOCATION_INFO);
      testLocationInfoStorage(content);
    });
  });

  describe("CommentNode", function(){

    it('stores location info', function(){
      var comment = new handlebarsEnv.AST.CommentNode("HI", LOCATION_INFO);
      testLocationInfoStorage(comment);
    });
  });

  describe("IntegerNode", function(){

    it('stores location info', function(){
      var integer = new handlebarsEnv.AST.IntegerNode("6", LOCATION_INFO);
      testLocationInfoStorage(integer);
    });
  });

  describe("StringNode", function(){

    it('stores location info', function(){
      var string = new handlebarsEnv.AST.StringNode("6", LOCATION_INFO);
      testLocationInfoStorage(string);
    });
  });

  describe("BooleanNode", function(){

    it('stores location info', function(){
      var bool = new handlebarsEnv.AST.BooleanNode("true", LOCATION_INFO);
      testLocationInfoStorage(bool);
    });
  });

  describe("DataNode", function(){

    it('stores location info', function(){
      var data = new handlebarsEnv.AST.DataNode("YES", LOCATION_INFO);
      testLocationInfoStorage(data);
    });
  });

  describe("PartialNameNode", function(){

    it('stores location info', function(){
      var pnn = new handlebarsEnv.AST.PartialNameNode({original: "YES"}, LOCATION_INFO);
      testLocationInfoStorage(pnn);
    });
  });

  describe("PartialNode", function(){

    it('stores location info', function(){
      var pn = new handlebarsEnv.AST.PartialNode("so_partial", {}, {}, LOCATION_INFO);
      testLocationInfoStorage(pn);
    });
  });
  describe("ProgramNode", function(){

    describe("storing location info", function(){
      it("stores when `inverse` argument isn't passed", function(){
        var pn = new handlebarsEnv.AST.ProgramNode([], LOCATION_INFO);
        testLocationInfoStorage(pn);
      });

      it("stores when `inverse` or `stripInverse` arguments passed", function(){
        var pn = new handlebarsEnv.AST.ProgramNode([], {strip: {}}, undefined, LOCATION_INFO);
        testLocationInfoStorage(pn);

        var clone = {
          strip: {},
          firstLine: 0,
          lastLine: 0,
          firstColumn: 0,
          lastColumn: 0
        };
        pn = new handlebarsEnv.AST.ProgramNode([], {strip: {}}, [ clone ], LOCATION_INFO);
        testLocationInfoStorage(pn);

        // Assert that the newly created ProgramNode has the same location
        // information as the inverse
        testLocationInfoStorage(pn.inverse);
      });
    });
  });

  describe("Line Numbers", function(){
    var ast, statements;

    function testColumns(node, firstLine, lastLine, firstColumn, lastColumn){
      equals(node.firstLine, firstLine);
      equals(node.lastLine, lastLine);
      equals(node.firstColumn, firstColumn);
      equals(node.lastColumn, lastColumn);
    }

    ast = Handlebars.parse("line 1 {{line1Token}}\n line 2 {{line2token}}\n line 3 {{#blockHelperOnLine3}}\nline 4{{line4token}}\n" +
                           "line5{{else}}\n{{line6Token}}\n{{/blockHelperOnLine3}}");
    statements = ast.statements;

    it('gets ContentNode line numbers', function(){
      var contentNode = statements[0];
      testColumns(contentNode, 1, 1, 0, 7);
    });

    it('gets MustacheNode line numbers', function(){
      var mustacheNode = statements[1];
      testColumns(mustacheNode, 1, 1, 7, 21);
    });

    it('gets line numbers correct when newlines appear', function(){
      var secondContentNode = statements[2];
      testColumns(secondContentNode, 1, 2, 21, 8);
    });

    it('gets MustacheNode line numbers correct across newlines', function(){
      var secondMustacheNode = statements[3];
      testColumns(secondMustacheNode, 2, 2, 8, 22);
     });

     it('gets the block helper information correct', function(){
       var blockHelperNode = statements[5];
       testColumns(blockHelperNode, 3, 7, 8, 23);
     });

     it('correctly records the line numbers of an inverse of a block helper', function(){
       var blockHelperNode = statements[5],
           inverse = blockHelperNode.inverse;

       testColumns(inverse, 5, 6, 13, 0);
     });
  });
});

