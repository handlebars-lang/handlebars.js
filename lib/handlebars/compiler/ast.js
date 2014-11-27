import Exception from "../exception";

var AST = {
  ProgramNode: function(statements, blockParams, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'Program';
    this.body = statements;

    this.blockParams = blockParams;
    this.strip = strip;
  },

  MustacheNode: function(rawParams, open, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'MustacheStatement';

    this.sexpr = rawParams;

    // Open may be a string parsed from the parser or a passed boolean flag
    if (open != null && open.charAt) {
      // Must use charAt to support IE pre-10
      var escapeFlag = open.charAt(3) || open.charAt(2);
      this.escaped = escapeFlag !== '{' && escapeFlag !== '&';
    } else {
      this.escaped = !!open;
    }

    this.strip = strip;
  },

  BlockNode: function(sexpr, program, inverse, strip, locInfo) {
    this.loc = locInfo;

    this.type = 'BlockStatement';
    this.sexpr = sexpr;
    this.program  = program;
    this.inverse  = inverse;
    this.strip = strip;
  },

  PartialNode: function(sexpr, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'PartialStatement';
    this.sexpr = sexpr;
    this.indent = '';

    this.strip = strip;
    this.strip.inlineStandalone = true;
  },

  ContentNode: function(string, locInfo) {
    this.loc = locInfo;
    this.type = 'ContentStatement';
    this.original = this.value = string;
  },

  CommentNode: function(comment, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'CommentStatement';
    this.value = comment;

    this.strip = strip;
    strip.inlineStandalone = true;
  },

  SexprNode: function(rawParams, hash, locInfo) {
    this.loc = locInfo;

    this.type = 'SubExpression';
    this.path = rawParams[0];
    this.params = rawParams.slice(1);
    this.hash = hash;
  },

  PathNode: function(data, parts, locInfo) {
    this.loc = locInfo;
    this.type = 'PathExpression';

    var original = '',
        dig = [],
        depth = 0,
        depthString = '';

    for(var i=0,l=parts.length; i<l; i++) {
      var part = parts[i].part;
      original += (parts[i].separator || '') + part;

      if (part === '..' || part === '.' || part === 'this') {
        if (dig.length > 0) {
          throw new Exception('Invalid path: ' + original, this);
        } else if (part === '..') {
          depth++;
          depthString += '../';
        }
      } else {
        dig.push(part);
      }
    }

    this.data = data;
    this.original = (data ? '@' : '') + original;
    this.parts    = dig;
    this.depth    = depth;
  },

  StringNode: function(string, locInfo) {
    this.loc = locInfo;
    this.type = 'StringLiteral';
    this.original =
      this.value = string;
  },

  NumberNode: function(number, locInfo) {
    this.loc = locInfo;
    this.type = 'NumberLiteral';
    this.original =
      this.value = Number(number);
  },

  BooleanNode: function(bool, locInfo) {
    this.loc = locInfo;
    this.type = 'BooleanLiteral';
    this.value = bool === 'true';
  },

  HashNode: function(pairs, locInfo) {
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
// most modify the object to operate properly.
export default AST;
