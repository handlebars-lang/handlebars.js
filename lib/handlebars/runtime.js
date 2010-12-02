if(exports) {
  var inspect = function(obj) {
    require("sys").print(require("sys").inspect(obj) + "\n");
  }
  var Handlebars = {};
  Handlebars.AST = require("handlebars/ast");
  Handlebars.Visitor = require("handlebars/jison_ext").Visitor;
}

// A Context wraps data, and makes it possible to extract a
// new Context given a path. For instance, if the data
// is { person: { name: "Alan" } }, a Context wrapping
// "Alan" can be extracted by searching for "person/name"
Handlebars.Context = function(data, fallback) {
  this.data     = data;
  this.fallback = fallback;
};

Handlebars.Context.prototype = {
  isContext: true,

  // Make a shallow copy of the Context
  clone: function() {
    var context = new Handlebars.Context;
    context.data = this.data;
    context.fallback = this.fallback;
    return context;
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

    if(parts.length === 1 && context.data === undefined) {
      context.data = context.fallback[parts[0]];
    }

    return context;
  }
};

Handlebars.K = function() { return this; };

Handlebars.proxy = function(obj) {
  var Proxy = this.K;
  Proxy.prototype = obj;
  return new Proxy;
}

Handlebars.Runtime = function(context, fallback, stack) {
  this.stack = stack || [];
  this.buffer = "";

  var newContext = this.context = new Handlebars.Context;

  if(context && context.isContext) {
    newContext.data     = context.data;
    newContext.fallback = context.fallback;
  } else {
    newContext.data     = context;
    newContext.fallback = fallback || {};
  }
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
      this.accept(statements[i]);
    }

    return this.buffer;
  },

  mustache: function(mustache) {
    var idObj  = this.accept(mustache.id);
    var params = mustache.params;
    var buf;

    for(var i=0, l=params.length; i<l; i++) {
      params[i] = this.accept(params[i]).data;
    }

    if(toString.call(idObj.data) === "[object Function]") {
      buf = idObj.data.apply(this.wrapContext(), params);
    } else {
      if(params.length) { throw new Error(mustache.id.parts.join("/") + " is not a Function, so you cannot have Function parameters"); }
      buf = idObj.data;
    }

    if(buf && mustache.escaped) { buf = Handlebars.Utils.escapeExpression(buf); }

    this.buffer = this.buffer + (buf == null ? '' : buf);
  },

  block: function(block) {
    var mustache = block.mustache,
        id       = mustache.id;

    var idObj    = this.accept(mustache.id),
        data     = idObj.data;

    if(toString.call(data) !== "[object Function]") {
      params = [data];
      data   = this.context.evaluate({depth: 0, parts: ["helperMissing"]}, this.stack).data;
    } else {
      params = this.evaluateParams(mustache.params);
    }

    var context = this.wrapContext();
    params.push(this.wrapProgram(block.program));
    this.buffer = this.buffer + data.apply(this.wrapContext(), params);
  },

  content: function(content) {
    this.buffer += content.string;
  },

  comment: function() {},

  evaluateParams: function(params) {
    for(var i=0, l=params.length; i<l; i++) {
      params[i] = this.accept(params[i]).data;
    }
    return params;
  },

  wrapContext: function() {
    var data      = this.context.data;
    var proxy     = Handlebars.proxy(data);
    var context   = proxy.__context__ = this.context;
    var stack     = proxy.__stack__   = this.stack.slice(0);

    proxy.__get__ = function(path) {
      return context.evaluate(path, stack).data
    };

    proxy.isWrappedContext = true;
    proxy.__data__         = data;

    return proxy;
  },

  wrapProgram: function(program) {
    var runtime = this, stack = this.stack.slice(0);
    stack.push(this.context);
    var fallback = this.context.fallback;

    return function(context) {
      if(context.isWrappedContext) { context = context.__data__; }
      var runtime = new Handlebars.Runtime(context, fallback, stack);
      runtime.accept(program);
      return runtime.buffer;
    }
  }

}

if(exports) {
  exports.Runtime = Handlebars.Runtime;
}
