Handlebars = {
  compile: function(string) {
    var compiler = new Handlebars.Compiler(string);
    compiler.compile();
    var result = compiler.fn;
    console.log(result);
    return new Function("context", "fallback", "fallback = fallback || {}; var stack = [];" + result);
  },

  isFunction: function(fn) {
    return toString.call(fn) === "[object Function]";
  },

  escapeText: function(string) {
    string = string.replace("'", "\\'");
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

    return string.replace(/&(?!\w+;)|["\\<>]/g, function(str) {
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
    } else if(toString.call(value) === "[object Array]" && value.length == 0) {
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
  } else if(toString.call(object) === "[object Array]") {
    for(var i=0, j=object.length; i<j; i++) {
      ret = ret + fn(object[i]);
    }
    return ret;
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

  addExpression: function(mustache) {
    var expr = this.lookupFor(mustache);

    this.fn += "if (Handlebars.isFunction(" + expr + ")) out = out + Handlebars.filterOutput(" + expr + ".call(Handlebars.buildContext(context, stack)), " + this.escaped + "); ";
    this.fn += "else if(typeof " + expr + "!== 'undefined') out = out + Handlebars.filterOutput(" + expr + ", " + this.escaped + ");";
  },

  addInvertedSection: function(mustache) {
    var compiler = this.compileToEndOfBlock(mustache);
    var result = compiler.fn;
    
    // each function made internally needs a unique IDs. These are locals, so they
    // don't need to be globally unique, just per compiler
    var fnId = "fn" + this.pointer.toString();
    this.fn += "var proxy = Handlebars.buildContext(context, stack);";
    this.fn += "var " + fnId + " = function(context) {" + result + "}; ";
    this.fn += "lookup = " + this.lookupFor(mustache) + "; ";
    this.fn += "if(Handlebars.isFunction(lookup) && Handlebars.isEmpty(lookup())) out = out + " + fnId + "(proxy);";
    this.fn += "else if (Handlebars.isEmpty(lookup)) out = out + " + fnId + "(proxy);";

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
      return "( context" + paramExpr + " || fallback " + paramExpr + " )";
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
    this.fn += "var " + fnId + " = function(context) {" + result + "}; ";
    this.fn += "lookup = " + this.lookupFor(mustache) + "; ";
    this.fn += "if(Handlebars.isFunction(lookup)) out = out + lookup.call(proxy, " + fnId + "); ";
    this.fn += "else if(typeof lookup !== 'undefined') out = out + Handlebars.helperMissing.call(proxy, lookup, " + fnId + "); ";

    if (compiler.continueInverted) {
      var invertedCompiler = this.compileToEndOfBlock(mustache);
      this.fn += "if (Handlebars.isFunction(lookup.not)) {";
      this.fn += "  var " + fnId + "Not = function(context) { " + invertedCompiler.fn + " };";
      this.fn += "  out = out + lookup.not.call(proxy, " + fnId + "Not);";
      this.fn += "}";
    }

    this.fn += "stack.pop();";
    this.openBlock = false;
  },

  addPartial: function(mustache, param) {
    // either used a cached copy of the partial or compile a new one
    this.fn += "if (typeof fallback['partials'] === 'undefined' || typeof fallback['partials']['" + mustache + "'] === 'undefined') throw new Handlebars.Exception('Attempted to render undefined partial: " + mustache + "');";  
    this.fn += "if (!Handlebars.isFunction(fallback['partials']['" + mustache + "'])) fallback['partials']['" + mustache + "'] = Handlebars.compile(fallback['partials']['" + mustache + "']);";
    this.fn += "out = out + fallback['partials']['" + mustache + "'](" + param + ", fallback);";
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
        var parts = this.mustache.trim().split(/\s+/);
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
          return this.addExpression(mustache);
        }

        this.escaped = true;
      } else if(this.comment) {
        ;
      } else {
        this.mustache = this.mustache + chr;
      }
    }
  }
}
