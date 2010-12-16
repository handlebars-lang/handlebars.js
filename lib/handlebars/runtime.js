var inspect = function(obj) {
  require("sys").print(require("sys").inspect(obj) + "\n");
};

var Handlebars = {};

Handlebars.AST             = require("handlebars/ast").AST;
Handlebars.HandlebarsLexer = require("handlebars/handlebars_lexer").Lexer;
Handlebars.Visitor         = require("handlebars/jison_ext").Visitor;
Handlebars.PrintVisitor    = require("handlebars/printer").PrintVisitor;
Handlebars.Parser          = require("handlebars/parser").parser;
Handlebars.Runtime         = require("handlebars/runtime").Runtime;
Handlebars.Utils           = require("handlebars/utils").Utils;
Handlebars.SafeString      = require("handlebars/utils").SafeString;
Handlebars.Exception       = require("handlebars/utils").Exception;
Handlebars.parse           = require("handlebars/compiler").Handlebars.parse;

// BEGIN(BROWSER)
// A Context wraps data, and makes it possible to extract a
// new Context given a path. For instance, if the data
// is { person: { name: "Alan" } }, a Context wrapping
// "Alan" can be extracted by searching for "person/name"
Handlebars.Context = function(data, helpers, partials) {
  this.data     = data;
  this.helpers  = helpers || {};
  this.partials = partials || {};
};

Handlebars.Context.prototype = {
  isContext: true,

  // Make a shallow copy of the Context
  clone: function() {
    return new Handlebars.Context(this.data, this.helpers, this.partials);
  },

  // Search for an object inside the Context's data. The
  // path parameter is an object with parts
  // ("person/name" represented as ["person", "name"]),
  // and depth (the amount of levels to go up the stack,
  // originally represented as ..). The stack parameter
  // is the objects already searched from the root of
  // the original Context in order to get to this point.
  //
  // Return a new Context wrapping the data found in
  // the search.
  evaluate: function(path, stack) {
    var context = this.clone();
    var depth = path.depth, parts = path.parts;

    if(depth > stack.length) { context.data = null; }
    else if(depth > 0) { context = stack[stack.length - depth].clone(); }

    for(var i=0,l=parts.length; i<l && context.data != null; i++) {
      context.data = context.data[parts[i]];
    }

    if(context.data !== undefined) { return context; }

    if(parts.length === 1 && context.data === undefined) {
      context.data = context.helpers[parts[0]];
    }

    return context;
  }
};

Handlebars.K = function() { return this; };

Handlebars.proxy = function(obj) {
  var Proxy = this.K;
  Proxy.prototype = obj;
  return new Proxy();
};

Handlebars.Runtime = function(context, stack) {
  this.stack = stack || [];
  this.buffer = "";

  this.context = context;
};

Handlebars.Runtime.prototype = {
  accept: Handlebars.Visitor.prototype.accept,

  ID: function(path) {
    return this.context.evaluate(path, this.stack);
  },

  STRING: function(string) {
    return { data: string.string };
  },

  program: function(program) {
    var statements = program.statements;

    for(var i=0, l=statements.length; i<l; i++) {
      var statement = statements[i];
      this[statement.type](statement);
    }

    return this.buffer;
  },

  mustache: function(mustache) {
    var idObj  = this.ID(mustache.id);
    var params = mustache.params.slice(0);
    var buf;

    for(var i=0, l=params.length; i<l; i++) {
      var param = params[i];
      params[i] = this[param.type](param).data;
    }

    var data = idObj.data;

    var type = toString.call(data);
    var functionType = (type === "[object Function]");

    if(!functionType && params.length) {
      params = params.slice(0);
      params.unshift(data || mustache.id.original);
      data = this.context.helpers.helperMissing;
      functionType = true;
    }

    if(functionType) {
      buf = data.apply(this.wrapContext(), params);
    } else {
      buf = data;
    }

    if(buf && mustache.escaped) { buf = Handlebars.Utils.escapeExpression(buf); }

    this.buffer = this.buffer + ((!buf && buf !== 0) ? '' : buf);
  },

  block: function(block) {
    var mustache = block.mustache, data;

    var id       = mustache.id,
        idObj    = this.ID(mustache.id),
        data     = idObj.data;

    var result;

    if(typeof data === "function") {
      params = this.evaluateParams(mustache.params);
    } else {
      params = [data];
      data   = this.context.helpers.blockHelperMissing;
    }

    params.push(this.wrapProgram(block.program));
    result = data.apply(this.wrapContext(), params);
    this.buffer = this.buffer + result;

    if(block.program.inverse) {
      params.pop();
      params.push(this.wrapProgram(block.program.inverse));
      result = data.not ? data.not.apply(this.wrapContext(), params) : "";
      this.buffer = this.buffer + result;
    }
  },

  partial: function(partial) {
    var partials = this.context.partials || {};
    var id = partial.id.original;

    var partialBody = partials[partial.id.original];
    var program, context;

    if(!partialBody) {
      throw new Handlebars.Exception("The partial " + partial.id.original + " does not exist");
    }

    if(typeof partialBody === "string") {
      program = Handlebars.parse(partialBody);
      partials[id] = program;
    } else {
      program = partialBody;
    }

    if(partial.context) {
      context = this.ID(partial.context);
    } else {
      context = this.context;
    }
    var runtime = new Handlebars.Runtime(context, this.stack);
    this.buffer = this.buffer + runtime.program(program);
  },

  not: function(context, fn) {
    return fn(context);
  },

  // TODO: Write down the actual spec for inverse sections...
  inverse: function(block) {
    var mustache  = block.mustache,
        id        = mustache.id,
        not;

    var idObj     = this.ID(id),
        data      = idObj.data,
        isInverse = Handlebars.Utils.isEmpty(data);


    var context = this.wrapContext();

    if(toString.call(data) === "[object Function]") {
      params  = this.evaluateParams(mustache.params);
      id      = id.parts.join("/");

      data = data.apply(context, params);
      if(Handlebars.Utils.isEmpty(data)) { isInverse = true; }
      if(data.not) { not = data.not; } else { not = this.not; }
    } else {
      not = this.not;
    }

    var result = not(context, this.wrapProgram(block.program));
    if(result != null) { this.buffer = this.buffer + result; }
    return;
  },

  content: function(content) {
    this.buffer += content.string;
  },

  comment: function() {},

  evaluateParams: function(params) {
    var ret = [];

    for(var i=0, l=params.length; i<l; i++) {
      var param = params[i];
      ret[i] = this[param.type](param).data;
    }

    if(ret.length === 0) { ret = [this.wrapContext()]; }
    return ret;
  },

  wrapContext: function() {
    var data      = this.context.data;
    var proxy     = Handlebars.proxy(data);
    var context   = proxy.__context__ = this.context;
    var stack     = proxy.__stack__   = this.stack.slice(0);

    proxy.__get__ = function(path) {
      path = new Handlebars.AST.IdNode(path.split("/"));
      return context.evaluate(path, stack).data;
    };

    proxy.isWrappedContext = true;
    proxy.__data__         = data;

    return proxy;
  },

  wrapProgram: function(program) {
    var currentContext = this.context;
    var stack = this.stack.slice(0);

    return function(context) {
      if(context && context.isWrappedContext) { context = context.__data__; }

      stack.push(currentContext);
      var newContext = new Handlebars.Context(context, currentContext.helpers, currentContext.partials);
      var runtime = new Handlebars.Runtime(newContext, stack);
      runtime.program(program);
      return runtime.buffer;
    };
  }

};
// END(BROWSER)

exports.Runtime = Handlebars.Runtime;
exports.Context = Handlebars.Context;
