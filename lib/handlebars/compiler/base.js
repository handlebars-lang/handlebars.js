var handlebars = require("./parser").parser;

exports.attach = function(Handlebars) {
	
	// BEGIN(BROWSER)
	
	Handlebars.Parser = handlebars;

	Handlebars.parse = function(string) {
	  Handlebars.Parser.yy = Handlebars.AST;
	  return Handlebars.Parser.parse(string);
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

	return Handlebars;

	// END(BROWSER)
};
