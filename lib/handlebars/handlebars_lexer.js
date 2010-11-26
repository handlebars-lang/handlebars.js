if(exports) {
  var Handlebars = {};
  Handlebars.Lexer = require("handlebars/jison_ext").Lexer
}

Handlebars.HandlebarsLexer = function() {
  this.state = "CONTENT";
};
Handlebars.HandlebarsLexer.prototype = new Handlebars.Lexer;

// The HandlebarsLexer uses a Lexer interface that is compatible
// with Jison.
//
// setupLex      reset internal state for a new token
// peek(n)       lookahead n characters and return (default 1)
// getchar(n)    remove n characters from the input and add
//               them to the matched text (default 1)
// readchar(n)   remove n characters from the input, but do not
//               add them to the matched text (default 1)
// ignorechar(n) remove n characters from the input, and act
//               as though they were already matched in a
//               previous lex. this will ensure that the
//               pointer in the case of parse errors is in
//               the right place.
Handlebars.HandlebarsLexer.prototype.lex = function() {
  if(this.input === "") return;

  this.setupLex();

  var lookahead = this.peek(2);
  var result = '';

  if(lookahead === "") return;

  if(this.state == "MUSTACHE") {
    if(this.peek() === "/") {
      this.getchar();
      return "SEP";
    }

    // chomp optional whitespace
    while(this.peek() === " ") { this.ignorechar(); }

    var lookahead = this.peek(2);

    // in a mustache, but less than 2 characters left => error
    if(lookahead.length != 2) { return; }

    // if the next characters are '}}', the mustache is done
    if(lookahead === "}}") {
      this.state = "CONTENT"
      this.getchar(2);

      // handle the case of {{{ foo }}} by always chomping
      // a final }. TODO: Track escape state and handle the
      // error condition here
      if(this.peek() == "}") this.getchar();
      return "CLOSE";

    // if the next character is a quote => enter a String
    } else if(this.peek() === '"') {
      this.readchar();

      // scan the String until another quote is reached, skipping over escaped quotes
      while(this.peek() !== '"') { if(this.peek(2) === '\\"') { this.readchar() }; this.getchar() }
      this.readchar();
      return "STRING";

    // All other cases are IDs or errors
    } else {
      // grab alphanumeric characters
      while(this.peek().match(/[0-9A-Za-z\.]/)) { this.getchar() }

      // if any characters were grabbed => ID
      if(this.yytext.length) { return "ID" }

      // Otherwise => Error
      else return;
    }

  // Next chars are {{ => Open mustache
  } else if(lookahead == "{{") {
    this.state = "MUSTACHE";
    this.getchar(2);

    var peek = this.peek();

    if(peek === ">") {
      this.getchar();
      return "OPEN_PARTIAL";
    } else if(peek === "#") {
      this.getchar();
      return "OPEN_BLOCK";
    } else if(peek === "/") {
      this.getchar();
      return "OPEN_ENDBLOCK";
    } else if(peek === "^") {
      this.getchar();
      return "OPEN_INVERSE"
    } else if(peek === "!") {
      this.readchar();
      this.setupLex(); // reset the lexer state so the yytext is the comment only
      while(this.peek(2) !== "}}") { this.getchar(); };
      this.readchar(2);
      this.state = "CONTENT"
      return "COMMENT";
    } else {
      return "OPEN";
    }

  // Otherwise => content section
  } else {
    while(this.peek(2) !== "{{" && this.peek(2) !== "") { result = result + this.getchar(); }
    return "CONTENT"
  }
};

if(exports) { exports.Lexer = Handlebars.HandlebarsLexer; }
