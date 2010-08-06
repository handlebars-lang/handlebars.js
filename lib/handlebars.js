Handlebars = {
  compile: function(string) {
    var compiler = new Handlebars.Compiler(string);
    var result   = compiler.compile();
    return new Function("context", "fallback", "fallback = fallback || {}; var stack = [];" + result);
  },

  isFunction: function(fn) {
    return toString.call(fn) === "[object Function]";
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
}

Handlebars.ParseError = function(message) {
  this.message = message;
}

// Returns a two element array containing the numbers of contexts to back up the stack and
// the properties to dig into on the current context
Handlebars.parsePath = function(path) {
  if (path == null) {
    return [0, []];
  }

  var parts = path.split("/");
  var readDepth = false;
  var depth = 0;
  var dig = [];
  for (var i = 0; i < parts.length; i++) {
    switch(parts[i]) {
      case "..":
        if (readDepth) {
          throw new Handlebars.ParseError("Cannot jump out of context after moving into a context."); 
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

      if(endCondition && endCondition(this)) { break };
    }

    this.addText();
    return this.fn + "return out;";
  },

  addText: function() {
    if(this.text) {
      this.fn       = this.fn + "out = out + '" + this.text + "'; ";
      this.fn       = this.fn + this.newlines;
      this.newlines = "";
      this.text     = "";
    }
  },

  addExpression: function(mustache) {
    this.fn += "out = out + " + this.lookupFor(mustache) + "; ";
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

  parseMustache: function() {
    var chr, part, mustache, param;

    var next = this.peek();

    if(next === "!") {
      this.comment = true;
      this.getChar();
    } else if(next === "#") {
      this.openBlock = true;
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
        this.getChar();
        if(this.comment) {
          this.comment = false;
          return;
        } else if(this.openBlock) {
          // set up the stack before the new compiler starts
          this.fn += "stack.push(context);";
          var compiler = new Handlebars.Compiler(this.string.slice(this.pointer + 1, -1));

          // sub-compile with a custom EOF instruction
          var result = compiler.compile(function(compiler) {
            if(compiler.peek(mustache.length + 5) === "{{/" + mustache + "}}") {
              compiler.getChar(mustache.length + 5);
              return true;
            }
          });

          // move the pointer forward the amount of characters handled by the sub-compiler
          this.pointer += compiler.pointer + 1;

          // each function made internally needs a unique IDs. These are locals, so they
          // don't need to be globally unique, just per compiler
          var fnId = "fn" + this.pointer.toString();

          this.fn += "var " + fnId + " = function(context) {" + result + "}; ";
          this.fn += "lookup = " + this.lookupFor(mustache) + "; ";
          this.fn += "if(Handlebars.isFunction(lookup)) out = out + lookup.call(" + param + ", " + fnId + "); ";
          this.fn += "else if(typeof lookup !== 'undefined') out = out + Handlebars.helperMissing.call(" + param + ", lookup, " + fnId + "); ";

          this.fn += "stack.pop();";
          this.openBlock = false;
          return;
        } else {
          this.addExpression(mustache);
          return;
        }
      } else if(this.comment) {
        ;
      } else {
        this.mustache = this.mustache + chr;
      }
    }
  }
}

