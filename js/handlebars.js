Handlebars = {
  compile: function(string) {
    var compiler = new Handlebars.Compiler(string);
    return compiler.compile();
  }
}

Handlebars.Compiler = function(string) {
  this.string   = string;
  this.pointer  = -1;
  this.mustache = false;
  this.text     = "";
  this.fn       = "var out = ''; ";
  this.newlines = "";
  this.comment  = false;
}

Handlebars.Compiler.prototype = {
  getChar: function() {
    this.pointer++;
    return this.string[this.pointer];
  },

  peek: function(n) {
    n = n || 1;
    var start = this.pointer + 1;
    return this.string.slice(start, start + n);
  },

  compile: function() {
    var chr;
    while(chr = this.getChar()) {
      // entering mustache state
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
    }

    this.fn = this.fn + "\nreturn out;";
    return new Function("context", this.fn);
  },

  parseMustache: function() {
    var chr, mustache;

    if(this.peek() === "!") {
      this.comment = true;
      this.getChar();
    }

    this.fn       = this.fn + "out = out + '" + this.text + "'; ";
    this.fn       = this.fn + this.newlines;
    this.newlines = ""
    this.text     = ""
    this.mustache = " ";

    while(chr = this.getChar()) {
      if(this.mustache && chr === "}" && this.peek() === "}") {
        mustache = this.mustache.trim();
        this.mustache = false;
        this.getChar();
        if(this.comment) { this.comment = false; return; }
        this.fn       = this.fn + "out = out + context['" + mustache + "']; ";
        return;
      } else if(this.comment) {
        ;
      } else {
        this.mustache = this.mustache + chr;
      }
    }
  }
}
