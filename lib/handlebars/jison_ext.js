if(exports) { var Handlebars = {} }

Handlebars.Lexer = function() {};

Handlebars.Lexer.prototype = {
  setInput: function(input) {
    this.input = input;
    this.matched = this.match = '';
    this.yylineno = 0;
  },

  setupLex: function() {
    this.yyleng = 0;
    this.yytext = '';
    this.match = '';
    this.readchars = 0;
  },

  getchar: function(n) {
    n = n || 1;
    var chars = "", char = "";

    for(var i=0; i<n; i++) {
      char = this.input[0];
      chars += char;
      this.yytext += char;
      this.yyleng++;

      this.matched += char;
      this.match += char;

      if(char === "\n") this.yylineno++;

      this.input = this.input.slice(1);
    }
    return char;
  },

  readchar: function(n, ignore) {
    n = n || 1;
    var char;

    for(var i=0; i<n; i++) {
      char = this.input[i];
      if(char === "\n") this.yylineno++;

      this.matched += char;
      this.match += char;
      if(ignore) { this.readchars++; }
    }

    this.input = this.input.slice(n);
  },

  ignorechar: function(n) {
    this.readchar(n, true);
  },

  peek: function(n) {
    return this.input.slice(0, n || 1);
  },

  pastInput:function () {
    var past = this.matched.substr(0, this.matched.length - this.match.length);
    return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
  },

  upcomingInput:function () {
    var next = this.match;
    if (next.length < 20) {
      next += this.input.substr(0, 20-next.length);
    }
    return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
  },

  showPosition:function () {
    var pre = this.pastInput();
    var c = new Array(pre.length + 1 + this.readchars).join("-");
    return pre + this.upcomingInput() + "\n" + c+"^";
  },
};

Handlebars.Visitor = function() {};

Handlebars.Visitor.prototype = {
  accept: function(object) {
    return this[object.type](object);
  }
}

if(exports) {
  exports.Lexer = Handlebars.Lexer;
  exports.Visitor = Handlebars.Visitor;
}
