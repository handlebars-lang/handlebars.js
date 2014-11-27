/*global Handlebars, handlebarsEnv, shouldThrow */
describe('ast', function() {
  if (!Handlebars.AST) {
    return;
  }

  var LOCATION_INFO = {
    start: {
      line: 1,
      column: 1
    },
    end: {
      line: 1,
      column: 1
    }
  };

  function testLocationInfoStorage(node){
    equals(node.loc.start.line, 1);
    equals(node.loc.start.column, 1);
    equals(node.loc.end.line, 1);
    equals(node.loc.end.column, 1);
  }

  describe('MustacheNode', function() {
    function testEscape(open, expected) {
      var mustache = new handlebarsEnv.AST.MustacheNode([{}], open, false);
      equals(mustache.escaped, expected);
    }

    it('should store args', function() {
      var id = {isSimple: true},
          hash = {},
          mustache = new handlebarsEnv.AST.MustacheNode([id, 'param1'], '', false, LOCATION_INFO);
      equals(mustache.type, 'MustacheStatement');
      equals(mustache.escaped, true);
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
    it('should throw on mustache mismatch', function() {
      shouldThrow(function() {
        handlebarsEnv.parse("\n  {{#foo}}{{/bar}}");
      }, Handlebars.Exception, "foo doesn't match bar - 2:5");
    });

    it('stores location info', function(){
      var sexprNode = new handlebarsEnv.AST.SexprNode([{ original: 'foo'}], null);
      var mustacheNode = new handlebarsEnv.AST.MustacheNode(sexprNode, null, '{{', {});
      var block = new handlebarsEnv.AST.BlockNode(mustacheNode,
                                                  {body: [], strip: {}}, {body: [], strip: {}},
                                                  {
                                                    strip: {},
                                                    path: {original: 'foo'}
                                                  },
                                                  LOCATION_INFO);
      testLocationInfoStorage(block);
    });
  });
  describe('PathNode', function() {
    it('should throw on invalid path', function() {
      shouldThrow(function() {
        new handlebarsEnv.AST.PathNode(false, [
          {part: 'foo'},
          {part: '..'},
          {part: 'bar'}
        ], {start: {line: 1, column: 1}});
      }, Handlebars.Exception, "Invalid path: foo.. - 1:1");
      shouldThrow(function() {
        new handlebarsEnv.AST.PathNode(false, [
          {part: 'foo'},
          {part: '.'},
          {part: 'bar'}
        ], {start: {line: 1, column: 1}});
      }, Handlebars.Exception, "Invalid path: foo. - 1:1");
      shouldThrow(function() {
        new handlebarsEnv.AST.PathNode(false, [
          {part: 'foo'},
          {part: 'this'},
          {part: 'bar'}
        ], {start: {line: 1, column: 1}});
      }, Handlebars.Exception, "Invalid path: foothis - 1:1");
    });

    it('stores location info', function(){
      var idNode = new handlebarsEnv.AST.PathNode(false, [], LOCATION_INFO);
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
      var comment = new handlebarsEnv.AST.CommentNode("HI", {}, LOCATION_INFO);
      testLocationInfoStorage(comment);
    });
  });

  describe("NumberNode", function(){

    it('stores location info', function(){
      var integer = new handlebarsEnv.AST.NumberNode("6", LOCATION_INFO);
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

  describe("PartialNode", function(){
    it('stores location info', function(){
      var pn = new handlebarsEnv.AST.PartialNode('so_partial', {}, LOCATION_INFO);
      testLocationInfoStorage(pn);
    });
  });

  describe('ProgramNode', function(){
    it('storing location info', function(){
      var pn = new handlebarsEnv.AST.ProgramNode([], null, {}, LOCATION_INFO);
      testLocationInfoStorage(pn);
    });
  });

  describe("Line Numbers", function(){
    var ast, body;

    function testColumns(node, firstLine, lastLine, firstColumn, lastColumn){
      equals(node.loc.start.line, firstLine);
      equals(node.loc.start.column, firstColumn);
      equals(node.loc.end.line, lastLine);
      equals(node.loc.end.column, lastColumn);
    }

    ast = Handlebars.parse("line 1 {{line1Token}}\n line 2 {{line2token}}\n line 3 {{#blockHelperOnLine3}}\nline 4{{line4token}}\n" +
                           "line5{{else}}\n{{line6Token}}\n{{/blockHelperOnLine3}}");
    body = ast.body;

    it('gets ContentNode line numbers', function(){
      var contentNode = body[0];
      testColumns(contentNode, 1, 1, 0, 7);
    });

    it('gets MustacheNode line numbers', function(){
      var mustacheNode = body[1];
      testColumns(mustacheNode, 1, 1, 7, 21);
    });

    it('gets line numbers correct when newlines appear', function(){
      testColumns(body[2], 1, 2, 21, 8);
    });

    it('gets MustacheNode line numbers correct across newlines', function(){
      var secondMustacheNode = body[3];
      testColumns(secondMustacheNode, 2, 2, 8, 22);
     });

     it('gets the block helper information correct', function(){
       var blockHelperNode = body[5];
       testColumns(blockHelperNode, 3, 7, 8, 23);
     });

     it('correctly records the line numbers the program of a block helper', function(){
       var blockHelperNode = body[5],
           program = blockHelperNode.program;

       testColumns(program, 3, 5, 8, 5);
     });

     it('correctly records the line numbers of an inverse of a block helper', function(){
       var blockHelperNode = body[5],
           inverse = blockHelperNode.inverse;

       testColumns(inverse, 5, 7, 5, 0);
     });
  });

  describe('standalone flags', function(){
    describe('mustache', function() {
      it('does not mark mustaches as standalone', function() {
        var ast = Handlebars.parse('  {{comment}} ');
        equals(!!ast.body[0].value, true);
        equals(!!ast.body[2].value, true);
      });
    });
    describe('blocks', function() {
      it('marks block mustaches as standalone', function() {
        var ast = Handlebars.parse(' {{# comment}} \nfoo\n {{else}} \n  bar \n  {{/comment}} '),
            block = ast.body[1];

        equals(ast.body[0].value, '');

        equals(block.program.body[0].value, 'foo\n');
        equals(block.inverse.body[0].value, '  bar \n');

        equals(ast.body[2].value, '');
      });
      it('marks initial block mustaches as standalone', function() {
        var ast = Handlebars.parse('{{# comment}} \nfoo\n {{/comment}}'),
            block = ast.body[0];

        equals(block.program.body[0].value, 'foo\n');
      });
      it('marks mustaches with children as standalone', function() {
        var ast = Handlebars.parse('{{# comment}} \n{{foo}}\n {{/comment}}'),
            block = ast.body[0];

        equals(block.program.body[0].value, '');
        equals(block.program.body[1].sexpr.id.original, 'foo');
        equals(block.program.body[2].value, '\n');
      });
      it('marks nested block mustaches as standalone', function() {
        var ast = Handlebars.parse('{{#foo}} \n{{# comment}} \nfoo\n {{else}} \n  bar \n  {{/comment}} \n{{/foo}}'),
            body = ast.body[0].program.body,
            block = body[1];

        equals(body[0].value, '');

        equals(block.program.body[0].value, 'foo\n');
        equals(block.inverse.body[0].value, '  bar \n');

        equals(body[0].value, '');
      });
      it('does not mark nested block mustaches as standalone', function() {
        var ast = Handlebars.parse('{{#foo}} {{# comment}} \nfoo\n {{else}} \n  bar \n  {{/comment}} {{/foo}}'),
            body = ast.body[0].program.body,
            block = body[1];

        equals(body[0].omit, undefined);

        equals(block.program.body[0].value, ' \nfoo\n');
        equals(block.inverse.body[0].value, '  bar \n  ');

        equals(body[0].omit, undefined);
      });
      it('does not mark nested initial block mustaches as standalone', function() {
        var ast = Handlebars.parse('{{#foo}}{{# comment}} \nfoo\n {{else}} \n  bar \n  {{/comment}}{{/foo}}'),
            body = ast.body[0].program.body,
            block = body[0];

        equals(block.program.body[0].value, ' \nfoo\n');
        equals(block.inverse.body[0].value, '  bar \n  ');

        equals(body[0].omit, undefined);
      });

      it('marks column 0 block mustaches as standalone', function() {
        var ast = Handlebars.parse('test\n{{# comment}} \nfoo\n {{else}} \n  bar \n  {{/comment}} '),
            block = ast.body[1];

        equals(ast.body[0].omit, undefined);

        equals(block.program.body[0].value, 'foo\n');
        equals(block.inverse.body[0].value, '  bar \n');

        equals(ast.body[2].value, '');
      });
    });
    describe('partials', function() {
      it('marks partial as standalone', function() {
        var ast = Handlebars.parse('{{> partial }} ');
        equals(ast.body[1].value, '');
      });
      it('marks indented partial as standalone', function() {
        var ast = Handlebars.parse('  {{> partial }} ');
        equals(ast.body[0].value, '');
        equals(ast.body[1].indent, '  ');
        equals(ast.body[2].value, '');
      });
      it('marks those around content as not standalone', function() {
        var ast = Handlebars.parse('a{{> partial }}');
        equals(ast.body[0].omit, undefined);

        ast = Handlebars.parse('{{> partial }}a');
        equals(ast.body[1].omit, undefined);
      });
    });
    describe('comments', function() {
      it('marks comment as standalone', function() {
        var ast = Handlebars.parse('{{! comment }} ');
        equals(ast.body[1].value, '');
      });
      it('marks indented comment as standalone', function() {
        var ast = Handlebars.parse('  {{! comment }} ');
        equals(ast.body[0].value, '');
        equals(ast.body[2].value, '');
      });
      it('marks those around content as not standalone', function() {
        var ast = Handlebars.parse('a{{! comment }}');
        equals(ast.body[0].omit, undefined);

        ast = Handlebars.parse('{{! comment }}a');
        equals(ast.body[1].omit, undefined);
      });
    });
  });
});

