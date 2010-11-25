if(exports) {
  var Handlebars = {};

  Handlebars.AST          = require("handlebars/ast").AST;
  Handlebars.Lexer        = require("handlebars/handlebars_lexer").Lexer;
  Handlebars.PrintVisitor = require("handlebars/printer").PrintVisitor;
  Handlebars.Parser       = require("handlebars/parser").parser;
}

Handlebars.parse = function(string) {
  Handlebars.Parser.yy = Handlebars.AST;
  Handlebars.Parser.lexer = new Handlebars.Lexer;
  return Handlebars.Parser.parse(string);
};

Handlebars.print = function(ast) {
  var out = new Handlebars.PrintVisitor().accept(ast);
  require("sys").print(out);
}

if(exports) { exports.Handlebars = Handlebars }
