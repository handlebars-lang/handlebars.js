var Handlebars = {
  compilerCache: {},

  compile: function(string) {
    if (Handlebars.compilerCache[string] == null) {
      var fnBody = Handlebars.compileFunctionBody(string);
      var fn = new Function("context", "fallback", "Handlebars", fnBody); 
      Handlebars.compilerCache[string] = 
          function(context, fallback) { return fn(context, fallback, Handlebars); };
    }

    return Handlebars.compilerCache[string];
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

  compilePartial: function(partial) {
    if (Handlebars.isFunction(partial)) {
      compiled = partial;
    } else {
      compiled = Handlebars.compile(partial);
    }
    
    return compiled;
  },

  evalExpression: function(path, context, stack) {
    var parsedPath = Handlebars.parsePath(path);
    var depth = parsedPath[0];
    var parts = parsedPath[1];
    if (depth > stack.length) {
      context = null;
    } else if (depth > 0) {
      context = stack[stack.length - depth];
    }

    for (var i = 0; i < parts.length && context !== undefined; i++) {
      context = context[parts[i]];
    }

    return context;
  },

  buildContext: function(context, stack) {
    var ContextWrapper = function(stack) { 
      this.__stack__ = stack.slice(0);
      this.__get__ = function(path) {
        return Handlebars.evalExpression(path, this, this.__stack__);
      };
    };

    ContextWrapper.prototype = context;
    return new ContextWrapper(stack);
  },

  // spot to memoize paths to speed up loops and subsequent parses
  pathPatterns: {},

  // returns a two element array containing the numbers of contexts to back up the stack and
  // the properties to dig into on the current context
  //
  // for example, if the path is "../../alan/name", the result will be [2, ["alan", "name"]].
  parsePath: function(path) {
    if (path == null) {
      return [0, []];
    } else if (Handlebars.pathPatterns[path] != null) {
      return Handlebars.pathPatterns[path];
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
   
    var ret = [depth, dig];
    Handlebars.pathPatterns[path] = ret;
    return ret;
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
      if (notFn != null && Handlebars.isFunction(lookup.not)) {
        out = out + lookup.not.call(context, arg, notFn); 
      } 
    }
    else {
      if (!Handlebars.isEmpty(lookup)) {
        out = out + Handlebars.helperMissing.call(arg, lookup, fn);
      }
      
      if (notFn != null) {
        out = out + Handlebars.helperMissing.not.call(arg, lookup, notFn);
      }
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
Handlebars.helperMissing.not = function(context, fn) {
  return fn(context);
}

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
    // if we're at the end condition already then we don't have to do any work!
    if (!endCondition || !endCondition(this)) {
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
          } else if (chr === "\\") {
            chr = "\\\\";
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

    if (depth > 0 || parts.length > 1) {
      return "(Handlebars.evalExpression('" + param + "', context, stack))";
    } else if (parts.length == 1) {
      return "(context['" + parts[0] + "'] || fallback['" + parts[0] + "'])";
    } else {
      return "(context || fallback)";
    }
  },

  compileToEndOfBlock: function(mustache) {
    var compiler = new Handlebars.Compiler(this.string.slice(this.pointer + 1));

    // sub-compile with a custom EOF instruction
    compiler.compile(function(compiler) {
      if (compiler.peek(3) === "{{/") {
        if(compiler.peek(mustache.length + 5) === "{{/" + mustache + "}}") {
          compiler.getChar(mustache.length + 5);
          return true;
        } else {
          throw new Handlebars.Exception("Mismatched block close: expected " + mustache + ".");
        }
      }
    });

    // move the pointer forward the amount of characters handled by the sub-compiler
    this.pointer += compiler.pointer + 1;

    return compiler;
  },

  addBlock: function(mustache, param, parts) {
    var compiler = this.compileToEndOfBlock(mustache);
    var result = compiler.fn;

    // each function made internally needs a unique IDs. These are locals, so they
    // don't need to be globally unique, just per compiler
    var fnId = "fn" + this.pointer.toString();
    this.fn += "var wrappedContext = Handlebars.buildContext(context, stack);";
    this.fn += "stack.push(context);";
    this.fn += "var " + fnId + " = function(context) {" + result + "}; ";
    this.fn += "lookup = " + this.lookupFor(mustache) + "; ";
    
    if (compiler.continueInverted) {
      var invertedCompiler = this.compileToEndOfBlock(mustache);
      this.fn += "  var " + fnId + "Not = function(context) { " + invertedCompiler.fn + " };";
    }
    else {
      this.fn += " var " + fnId + "Not = null;";
    }
    this.fn += "out = out + Handlebars.handleBlock(lookup, wrappedContext, " + param + ", " + fnId + ", " + fnId + "Not);"

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
          this.partial = false;
          return;
        } else if (this.inverted) {
          this.addInvertedSection(mustache);
          this.inverted = false;
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
