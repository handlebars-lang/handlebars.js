if(exports) {
  var inspect = function(obj) {
    require("sys").print(require("sys").inspect(obj) + "\n");
  }
  var Handlebars = {};
  Handlebars.AST = require("handlebars/ast");
  Handlebars.Visitor = require("handlebars/jison_ext").Visitor;
}

Handlebars.Context = function(data, fallback) {
  this.data     = data;
  this.fallback = fallback;
};

Handlebars.Context.prototype = {
  isContext: true,

  clone: function() {
    var context = new Handlebars.Context;
    context.data = this.data;
    context.fallback = this.fallback;
    return context;
  },

  evaluate: function(path, stack) {
    var context = this.clone();
    var depth = path.depth, dig = path.dig, parts = path.parts;

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

  if(context.isContext) {
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
  },

  mustache: function(mustache) {
    var idObj  = this.accept(mustache.id);
    var params = mustache.params;

    for(var i=0, l=params.length; i<l; i++) {
      params[i] = this.accept(params[i]).data;
    }

    if(toString.call(idObj.data) === "[object Function]") {
      this.buffer = this.buffer + idObj.data.apply(this.wrapContext(), params);
    } else {
      if(params.length) { throw new Error(mustache.id.parts.join("/") + " is not a Function, so you cannot have Function parameters"); }
      this.buffer = this.buffer + idObj.data;
    }
  },

  content: function(content) {
    this.buffer += content.string;
  },

  wrapContext: function() {
    var proxy     = Handlebars.proxy(this.context.data);
    var context   = proxy.__context__ = this.context;
    var stack     = proxy.__stack__   = this.stack.slice(0);

    proxy.__get__ = function(path) {
      return context.evaluate(path, stack).data
    };
  }

}

if(exports) {
  exports.Runtime = Handlebars.Runtime;
}
