var handlebars = require("./parser").parser;
var Handlebars = require("../base");

// BEGIN(BROWSER)
var hbExtender = function(a, b) {
  for(prop in b) {
    if(b.hasOwnProperty(prop)) {
      a[prop] = b[prop];
    }
  }
};

// Adapt the parser and lexer so they can be run in a sealed environment.
var jisonParser = handlebars.Parser.prototype;
delete jisonParser.yy;
var jisonLexer = jisonParser.lexer;
delete jisonParser.lexer;
delete jisonLexer.options;

Handlebars.HbLexer = function() {
  this.options = {};
};
hbExtender(Handlebars.HbLexer.prototype, jisonLexer);

Handlebars.HbParser = function() {
  this.lexer = new Handlebars.HbLexer();
  this.yy = new Handlebars.AST();
};
hbExtender(Handlebars.HbParser.prototype, jisonParser);

delete handlebars;

Handlebars.parse = function(string) {
  return (new Handlebars.HbParser()).parse(string);
};

Handlebars.print = function(ast) {
  return new Handlebars.PrintVisitor().accept(ast);
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  // override in the host environment
  log: function(level, str) {}
};

Handlebars.log = function(level, str) { Handlebars.logger.log(level, str); };

// END(BROWSER)

module.exports = Handlebars;
