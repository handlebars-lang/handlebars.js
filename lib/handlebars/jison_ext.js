if(exports) { var Handlebars = {} }

Handlebars.Lexer = function() {};

Handlebars.Lexer.prototype = {
  setInput: function(input) {
    this.input = input;
    this.yylineno = 0;
  },

  setupLex: function() {
    this.yyleng = 0;
    this.yytext = '';
  },

  getchar: function(n) {
    n = n || 1;
    var char = "";

    for(var i=0; i<n; i++) {
      char += this.input[0];
      this.yytext += this.input[0];
      this.yyleng++;

      if(char === "\n") this.yylineno++;

      this.input = this.input.slice(1);
    }
    return char;
  },

  readchar: function(n) {
    n = n || 1;
    var char;

    for(var i=0; i<n; i++) {
      char = this.input[i];
      if(char === "\n") this.yylineno++;
    }

    this.input = this.input.slice(n);
  },

  peek: function(n) {
    return this.input.slice(0, n || 1);
  }
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
