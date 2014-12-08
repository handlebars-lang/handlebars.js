import Exception from "../exception";

var AST = {
  Program: function(statements, blockParams, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'Program';
    this.body = statements;

    this.blockParams = blockParams;
    this.strip = strip;
  },

  MustacheStatement: function(sexpr, escaped, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'MustacheStatement';

    this.sexpr = sexpr;
    this.escaped = escaped;

    this.strip = strip;
  },

  BlockStatement: function(sexpr, program, inverse, openStrip, inverseStrip, closeStrip, locInfo) {
    this.loc = locInfo;

    this.type = 'BlockStatement';
    this.sexpr = sexpr;
    this.program  = program;
    this.inverse  = inverse;

    this.openStrip = openStrip;
    this.inverseStrip = inverseStrip;
    this.closeStrip = closeStrip;
  },

  PartialStatement: function(sexpr, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'PartialStatement';
    this.sexpr = sexpr;
    this.indent = '';

    this.strip = strip;
  },

  ContentStatement: function(string, locInfo) {
    this.loc = locInfo;
    this.type = 'ContentStatement';
    this.original = this.value = string;
  },

  CommentStatement: function(comment, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'CommentStatement';
    this.value = comment;

    this.strip = strip;
  },

  SubExpression: function(path, params, hash, locInfo) {
    this.loc = locInfo;

    this.type = 'SubExpression';
    this.path = path;
    this.params = params || [];
    this.hash = hash;
  },

  PathExpression: function(data, depth, parts, original, locInfo) {
    this.loc = locInfo;
    this.type = 'PathExpression';

    this.data = data;
    this.original = original;
    this.parts    = parts;
    this.depth    = depth;
  },

  StringLiteral: function(string, locInfo) {
    this.loc = locInfo;
    this.type = 'StringLiteral';
    this.original =
      this.value = string;
  },

  NumberLiteral: function(number, locInfo) {
    this.loc = locInfo;
    this.type = 'NumberLiteral';
    this.original =
      this.value = Number(number);
  },

  BooleanLiteral: function(bool, locInfo) {
    this.loc = locInfo;
    this.type = 'BooleanLiteral';
    this.original =
      this.value = bool === 'true';
  },

  Hash: function(pairs, locInfo) {
    this.loc = locInfo;
    this.type = 'Hash';
    this.pairs = pairs;
  },
  HashPair: function(key, value, locInfo) {
    this.loc = locInfo;
    this.type = 'HashPair';
    this.key = key;
    this.value = value;
  }
};


// Must be exported as an object rather than the root of the module as the jison lexer
// must modify the object to operate properly.
export default AST;
