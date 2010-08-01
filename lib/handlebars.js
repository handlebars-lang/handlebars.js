Handlebars = {
  compile: function(string) {
    var compiler = new Handlebars.Compiler(string);
    var result   = compiler.compile();
    return new Function("context", result);
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

Handlebars.catchAll = function(object, fn) {
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
      this.newlines = ""
      this.text     = ""
    }
  },

  addExpression: function(mustache) {
    this.fn = this.fn + "out = out + context['" + mustache + "']; ";
  },

  parseMustache: function() {
    var chr, mustache;

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
        mustache = this.mustache.trim();
        this.mustache = false;
        this.getChar();
        if(this.comment) {
          this.comment = false;
          return;
        } else if(this.openBlock) {
          var compiler = new Handlebars.Compiler(this.string.slice(this.pointer + 1, -1));

          // compile with a custom EOF instruction
          var result = compiler.compile(function(compiler) {
            if(compiler.peek(mustache.length + 5) === "{{/" + mustache + "}}") {
              compiler.getChar(mustache.length + 5);
              return true;
            }
          });
          this.pointer += compiler.pointer + 1;

          // each function made internally needs a unique IDs. These are locals, so they
          // don't need to be globally unique, just per compiler
          var fnId = "fn" + this.pointer.toString();

          this.fn += "var " + fnId + " = function(context) {" + result + "}; ";
          this.fn += "lookup = context['" + mustache + "']; ";
          this.fn += "if(Handlebars.isFunction(lookup)) out = out + " + fnId + "(lookup); "
          this.fn += "else if(typeof lookup !== 'undefined') out = out + Handlebars.catchAll(lookup, " + fnId + "); "

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

