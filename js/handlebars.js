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
}

Handlebars.Compiler.prototype = {
  getChar: function() {
    this.pointer++;
    return this.string[this.pointer];
  },

  peek: function(n) {
    n = n || 1;
    return this.string.slice(this.pointer, this.pointer + n);
  },

  compile: function() {
    var chr, mustache;
    while(chr = this.getChar()) {
      // entering mustache state
      if(chr === "{" && this.peek() === "{" && !this.mustache) {
        this.fn       = this.fn + "out = out + '" + this.text + "'; ";
        this.fn       = this.fn + this.newlines;
        this.newlines = ""
        this.text     = ""
        this.mustache = " ";
        this.getChar();

      // exiting mustache state
      } else if(this.mustache && chr === "}" && this.peek() === "}") {
        mustache = this.mustache.trim();
        this.fn       = this.fn + "out = out + context['" + mustache + "']; ";
        this.mustache = false;
        this.getChar();

      // in mustache state
      } else if(this.mustache) {
        this.mustache = this.mustache + chr;

      // in normal state
      } else {
        if(chr === "\n") {
          this.newlines = this.newlines + "\n";
          chr = "\\n";
        }
        this.text = this.text + chr;
      }
    }

    this.fn = this.fn + "\nreturn out;";
    console.log(this.fn);
    return new Function("context", this.fn);
  }
}
