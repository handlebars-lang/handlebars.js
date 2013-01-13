var handlebars = require("./parser");
var Handlebars = require("../base");

// BEGIN(BROWSER)
Handlebars.Parser = handlebars;

Handlebars.parse = function(string) {
  Handlebars.Parser.yy = Handlebars.AST;
  return Handlebars.Parser.parse(string);
};

Handlebars.print = function(ast) {
  return new Handlebars.PrintVisitor().accept(ast);
};
// END(BROWSER)

module.exports = Handlebars;
