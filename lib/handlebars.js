var ast     = require("handlebars/ast");
var Lexer   = require("handlebars/handlebars_lexer").Lexer;
var printer = require("handlebars/printer");
var parser  = require("handlebars/parser").parser;

parser.yy = {
  ProgramNode: ast.ProgramNode,
  MustacheNode: ast.MustacheNode,
  ContentNode: ast.ContentNode,
  IdNode: ast.IdNode,
  StringNode: ast.StringNode,
  PartialNode: ast.PartialNode,
  CommentNode: ast.CommentNode,
  BlockNode: ast.BlockNode,
  inspect: function(obj) {
    var sys = require("sys");
    sys.print(sys.inspect(obj) + "\n");
  }
}

parser.lexer = new Lexer;

exports.parse = function(string) {
  return parser.parse(string);
};

exports.print = function(ast) {
  var out = new PrintVisitor().accept(ast);
  require("sys").print(out);
}
