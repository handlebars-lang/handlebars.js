var Handlebars = {
  compile: function(string) {
    var fnBody = Handlebars.compileFunctionBody(string);
    var fn = new Function("context", "fallback", "Handlebars", fnBody); 
    return function(context, fallback) { return fn(context, fallback, Handlebars); };
  },

  compileToString: function(string) {
    var fnBody = Handlebars.compileFunctionBody(string);
    return "function(context, fallback) { " + fnBody + "}";
  },

  compileFunctionBody: function(string) {
    var compiler = new Handlebars.Compiler(string);
    compiler.compile();

    return "fallback = fallback || {}; var stack = [];" + compiler.fn;
  },

  isFunction: function(fn) {
    return Object.prototype.toString.call(fn) == "[object Function]";
  },

  trim: function(str) {
    return str.replace(/^\s+|\s+$/g, ''); 
  },

  escapeText: function(string) {
    string = string.replace(/'/g, "\\'");
    string = string.replace(/\"/g, "\\\"");
    if (string.slice(-1) == "\\") {
      string = string + "\\";
    }

    return string;
  },

  escapeExpression: function(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof Handlebars.SafeString) {
      return string.toString();
    }
    else if (string === null) {
      string = "";
    }

    return string.toString().replace(/&(?!\w+;)|["\\<>]/g, function(str) {
      switch(str) {
        case "&":
          return "&amp;";
          break;
        case '"':
          return "\"";
        case "\\":
          return "\\\\";
          break;
        case "<":
          return "&lt;";
          break;
        case ">":
          return "&gt;";
          break;
        default:
          return str;
      }
    });
  },

  compiledPartials: {},
  compilePartial: function(partial) {
    var compiled = Handlebars.compiledPartials[partial];

    if (compiled == null) {
      if (Handlebars.isFunction(partial)) {
        compiled = partial;
      } else {
        compiled = Handlebars.compile(partial);
      }
      Handlebars.compiledPartials[partial] = compiled;
    }
    
    return compiled;
  },

  buildContext: function(context, stack) {
    var contextWrapper = function(stack) { 
      this.__stack__ = stack;
      this.__get__ = function(path) {
        var context = this;
        var parsedPath = Handlebars.parsePath(path);
        var depth = parsedPath[0];
        var parts = parsedPath[1];
        if (depth > 0) {
          context = this.__stack__[stack.length - depth];
        }

        for (var i = 0; i < parts.length; i++) {
          context = context[parts[i]];
        }

        return context;
      };
    };

    contextWrapper.prototype = context;
    return new contextWrapper(stack);
  },

  // Returns a two element array containing the numbers of contexts to back up the stack and
  // the properties to dig into on the current context
  //
  // For example, if the path is "../../alan/name", the result will be [2, ["alan", "name"]].
  parsePath: function(path) {
    if (path == null) {
      return [0, []];
    }

    var parts = path.split("/");
    var readDepth = false;
    var depth = 0;
    var dig = [];
    for (var i = 0, j = parts.length; i < j; i++) {
      switch(parts[i]) {
        case "..":
          if (readDepth) {
            throw new Handlebars.Exception("Cannot jump out of context after moving into a context."); 
          } else {
            depth += 1;
          }
          break;
        case ".":
          // do nothing - using .'s is pretty dumb, but it's also basically free for us to support
        case "this":
          // if we do nothing you'll end up sticking in the same context
          break;
        default:
          readDepth = true;
          dig.push(parts[i]);
      }
    }

    return [depth, dig];
  },

  isEmpty: function(value) {
    if (typeof value === "undefined") {
      return true;
    } else if (!value) {
      return true;
    } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length == 0) {
      return true;
    } else {
      return false;
    }
  },

  // Escapes output and converts empty values to empty strings
  filterOutput: function(value, escape) {
    
    if (Handlebars.isEmpty(value)) {
      return "";
    } else if (escape) {
      return Handlebars.escapeExpression(value); 
    } else {
      return value;
    }
  },

  handleBlock: function(lookup, context, arg, fn, notFn) {
    var out = "";
    if (Handlebars.isFunction(lookup)) {
      out = out + lookup.call(context, arg, fn);
    }
    else if (typeof lookup != 'undefined') {
      out = out + Handlebars.helperMissing.call(arg, lookup, fn);
    }

    if (notFn != null && Handlebars.isFunction(lookup.not)) {
      out = out + lookup.not.call(context, arg, notFn); 
    }

    return out;
  },

  handleExpression: function(lookup, context, arg, isEscaped) {
    var out = "";
    if (Handlebars.isFunction(lookup)) {
      out = out + Handlebars.filterOutput(lookup.call(context, arg), isEscaped);
    } else if(!Handlebars.isEmpty(lookup)) {
      out = out + Handlebars.filterOutput(lookup, isEscaped);
    }

    return out;
  },

  handleInvertedSection: function(lookup, context, fn) {
    var out = "";
    if(Handlebars.isFunction(lookup) && Handlebars.isEmpty(lookup())) {
      out = out + fn(context);
    } else if (Handlebars.isEmpty(lookup)) {
      out = out + fn(context);
    }
    return out;
  }
}

Handlebars.Compiler = function(string) {
  this.string   = string;
  this.pointer  = -1;
  this.mustache = false;
  this.text     = "";
  this.fn       = "var out = ''; var lookup; ";
  this.newlines = "";
  this.comment  = false;
  this.escaped = true;
  this.partial = false;
  this.inverted = false;
  this.endCondition = null;
  this.continueInverted = false;
};

Handlebars.Exception = function(message) {
  this.message = message;
};

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
}
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
}

Handlebars.helperMissing = function(object, fn) {
  var ret = "";

  if(object === true) {
    return fn(this);
  } else if(object === false) {
    return "";
  } else if(Object.prototype.toString.call(object) === "[object Array]") {
    for(var i=0, j=object.length; i<j; i++) {
      ret = ret + fn(object[i]);
    }
    return ret;
  } else {
		return fn(object);
	}
};

Handlebars.Compiler.prototype = {
  getChar: function(n) {
    var ret = this.peek(n);
    this.pointer = this.pointer + (n || 1);
    return ret;
  },

  peek: function(n) {
    n = n || 1;
    var start = this.pointer + 1;
    return this.string.slice(start, start + n);
  },

  compile: function(endCondition) {
    var chr;
    while(chr = this.getChar()) {
      if(chr === "{" && this.peek() === "{" && !this.mustache) {
        this.getChar();
        this.parseMustache();

      } else {
        if(chr === "\n") {
          this.newlines = this.newlines + "\n";
          chr = "\\n";
        } else if (chr === "\r") {
          this.newlines = this.newlines + "\r";
          chr = "\\r";
        }
        this.text = this.text + chr;
      }

      if (endCondition && this.peek(5) == "{{^}}") {
        this.continueInverted = true;
        this.getChar(5);
        break;
      }
      else if(endCondition && endCondition(this)) { break };
    }

    this.addText();
    this.fn += "return out;";

    return;
  },

  addText: function() {
    if(this.text) {
      this.fn       = this.fn + "out = out + \"" + Handlebars.escapeText(this.text) + "\"; ";
      this.fn       = this.fn + this.newlines;
      this.newlines = "";
      this.text     = "";
    }
  },

  addExpression: function(mustache, param) {
    param = param || null; 
    var expr = this.lookupFor(mustache);
    this.fn += "var proxy = Handlebars.buildContext(context, stack);"
    this.fn += "out = out + Handlebars.handleExpression(" + expr + ", proxy, " + param + ", " + this.escaped + ");";
  },

  addInvertedSection: function(mustache) {
    var compiler = this.compileToEndOfBlock(mustache);
    var result = compiler.fn;
    
    // each function made internally needs a unique IDs. These are locals, so they
    // don't need to be globally unique, just per compiler
    var fnId = "fn" + this.pointer.toString();
    this.fn += "var " + fnId + " = function(context) {" + result + "}; ";
    this.fn += "lookup = " + this.lookupFor(mustache) + "; ";
    this.fn += "out = out + Handlebars.handleInvertedSection(lookup, context, " + fnId + ");"

    this.openBlock = false;
    this.inverted = false;
  },

  lookupFor: function(param) {
    var parsed = Handlebars.parsePath(param);
    var depth = parsed[0];
    var parts = parsed[1];

    var paramExpr = "";
    for(var i = 0; i < parts.length; i++) {
      paramExpr += "['" + parts[i] + "']";
    }

    if (depth > 0) {
      return "( stack[stack.length - " + depth + "]" + paramExpr + ")";
    } else {
      return "( context" + paramExpr + " || fallback" + paramExpr + " )";
    }
  },

  compileToEndOfBlock: function(mustache) {
    var compiler = new Handlebars.Compiler(this.string.slice(this.pointer + 1, -1));

    // sub-compile with a custom EOF instruction
    compiler.compile(function(compiler) {
      if(compiler.peek(mustache.length + 5) === "{{/" + mustache + "}}") {
        compiler.getChar(mustache.length + 5);
        return true;
      }
    });

    // move the pointer forward the amount of characters handled by the sub-compiler
    this.pointer += compiler.pointer + 1;

    return compiler;
  },

  addBlock: function(mustache, param, parts) {
    // set up the stack before the new compiler starts
    this.fn += "stack.push(context);";
    var compiler = this.compileToEndOfBlock(mustache);
    var result = compiler.fn;

    // each function made internally needs a unique IDs. These are locals, so they
    // don't need to be globally unique, just per compiler
    var fnId = "fn" + this.pointer.toString();
    this.fn += "var proxy = Handlebars.buildContext(" + param + ", stack);";
    this.fn += "var wrappedContext = Handlebars.buildContext(context);";
    this.fn += "var " + fnId + " = function(context) {" + result + "}; ";
    this.fn += "lookup = " + this.lookupFor(mustache) + "; ";
    
    if (compiler.continueInverted) {
      var invertedCompiler = this.compileToEndOfBlock(mustache);
      this.fn += "  var " + fnId + "Not = function(context) { " + invertedCompiler.fn + " };";
    }
    else {
      this.fn += " var " + fnId + "Not = null;";
    }
    this.fn += "out = out + Handlebars.handleBlock(lookup, wrappedContext, proxy, " + fnId + ", " + fnId + "Not);"

    this.fn += "stack.pop();";
    this.openBlock = false;
  },

  addPartial: function(mustache, param) {
    // either used a cached copy of the partial or compile a new one
    this.fn += "if (typeof fallback['partials'] === 'undefined' || typeof fallback['partials']['" + mustache + "'] === 'undefined') throw new Handlebars.Exception('Attempted to render undefined partial: " + mustache + "');";  
    this.fn += "out = out + Handlebars.compilePartial(fallback['partials']['" + mustache + "'])(" + param + ", fallback);";
  },

  parseMustache: function() {
    var chr, part, mustache, param;

    var next = this.peek();

    if(next === "!") {
      this.comment = true;
      this.getChar();
    } else if(next === "#") {
      this.openBlock = true;
      this.getChar();
    } else if (next === ">") {
      this.partial = true;
      this.getChar();
    } else if (next === "^") {
      this.inverted = true;
      this.openBlock = true;
      this.getChar();
    } else if(next === "{" || next === "&") {
      this.escaped = false;
      this.getChar();
    }

    this.addText();
    this.mustache = " ";

    while(chr = this.getChar()) {
      if(this.mustache && chr === "}" && this.peek() === "}") {
        var parts = Handlebars.trim(this.mustache).split(/\s+/);
        mustache  = parts[0];
        param     = this.lookupFor(parts[1]);

        this.mustache = false;

        // finish reading off the close of the handlebars
        this.getChar();
        // {{{expression}} is techically valid, but if we started with {{{ we'll try to read 
        // }}} off of the close of the handlebars
        if (!this.escaped && this.peek() === "}") {
          this.getChar();
        }

        if(this.comment) {
          this.comment = false;
          return;
        } else if (this.partial) {
          this.addPartial(mustache, param)
          return;
        } else if (this.inverted) {
          this.addInvertedSection(mustache);
          return;
        } else if(this.openBlock) {
          this.addBlock(mustache, param, parts)
          return;
        } else {
          return this.addExpression(mustache, param);
        }

        this.escaped = true;
      } else if(this.comment) {
        ;
      } else {
        this.mustache = this.mustache + chr;
      }
    }
  }
};

// CommonJS Exports
var exports = exports || {};
exports['compile'] = Handlebars.compile;
exports['compileToString'] = Handlebars.compileToString;
