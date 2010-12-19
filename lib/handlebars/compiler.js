var handlebars = require("handlebars/parser").parser;

// BEGIN(BROWSER)
Handlebars = {};

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
      helpers  = Handlebars.helpers;
    }

    if(!partials) {
      partials = Handlebars.partials;
    }

    var internalContext = new Handlebars.Context(context, helpers, partials);
    var runtime = new Handlebars.Runtime(internalContext);
    runtime.accept(ast);
    return runtime.buffer;
  };
};

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('blockHelperMissing', function(context, fn) {
  var ret = "";

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return "";
  } else if(Object.prototype.toString.call(context) === "[object Array]") {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
    return ret;
  } else {
		return fn(context);
	}
}, function(context, fn) {
  return fn(context)
});

Handlebars.registerHelper('each', function(context, fn, inverse) {
  var ret = "";

  if(context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, fn, inverse) {
  if(context === false || context == null) {
    return inverse(this);
  } else {
    return fn(this);
  }
});

// END(BROWSER)

exports.Handlebars = Handlebars;
