var Handlebars = {};

Handlebars.AST             = require("handlebars/ast").AST;
Handlebars.HandlebarsLexer = require("handlebars/handlebars_lexer").Lexer;
Handlebars.PrintVisitor    = require("handlebars/printer").PrintVisitor;
var handlebars             = require("handlebars/parser").parser;
Handlebars.Runtime         = require("handlebars/runtime").Runtime;
Handlebars.Utils           = require("handlebars/utils").Utils;
Handlebars.SafeString      = require("handlebars/utils").SafeString;
Handlebars.Exception       = require("handlebars/utils").Exception;

// BEGIN(BROWSER)
Handlebars.Parser = handlebars;

Handlebars.parse = function(string) {
  Handlebars.Parser.yy = Handlebars.AST;
  Handlebars.Parser.lexer = new Handlebars.HandlebarsLexer();
  return Handlebars.Parser.parse(string);
};

Handlebars.print = function(ast) {
  return new Handlebars.PrintVisitor().accept(ast);
};

Handlebars.compile = function(string) {
  var ast = Handlebars.parse(string);

  return function(context, fallback) {
    var runtime = new Handlebars.Runtime(context, fallback);
    runtime.accept(ast);
    return runtime.buffer;
  };
};
// END(BROWSER)

exports.Handlebars = Handlebars;
