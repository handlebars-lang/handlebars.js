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

  return function(context, helpers, partials) {
    var helpers, partials;

    if(!helpers) {
      helpers  = this.helpers;
    }

    if(!partials) {
      partials = this.partials;
    }

    var runtime = new Handlebars.Runtime(context, helpers, partials);
    runtime.accept(ast);
    return runtime.buffer;
  };
};

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn) {
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};
// END(BROWSER)

exports.Handlebars = Handlebars;
