if(exports) {
  var Handlebars = {};

  Handlebars.AST             = require("handlebars/ast").AST;
  Handlebars.HandlebarsLexer = require("handlebars/handlebars_lexer").Lexer;
  Handlebars.PrintVisitor    = require("handlebars/printer").PrintVisitor;
  Handlebars.Parser          = require("handlebars/parser").parser;
} else {
  Handlebars.Parser = handlebars;
}

Handlebars.parse = function(string) {
  Handlebars.Parser.yy = Handlebars.AST;
  Handlebars.Parser.lexer = new Handlebars.HandlebarsLexer;
  return Handlebars.Parser.parse(string);
};

Handlebars.print = function(ast) {
  return new Handlebars.PrintVisitor().accept(ast);
}

if(exports) { exports.Handlebars = Handlebars }
