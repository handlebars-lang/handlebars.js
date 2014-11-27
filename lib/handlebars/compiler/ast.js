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

    this.type = "sexpr";
    this.hash = hash;

    var id = this.id = rawParams[0];
    var params = this.params = rawParams.slice(1);

    // a mustache is definitely a helper if:
    // * it is an eligible helper, and
    // * it has at least one parameter or hash segment
    this.isHelper = !!(params.length || hash);

    // a mustache is an eligible helper if:
    // * its id is simple (a single part, not `this` or `..`)
    this.eligibleHelper = this.isHelper || id.isSimple;

    // if a mustache is an eligible helper but not a definite
    // helper, it is ambiguous, and will be resolved in a later
    // pass or at runtime.
  },

  HashNode: function(pairs, locInfo) {
    this.loc = locInfo;
    this.type = "hash";
    this.pairs = pairs;
  },

  IdNode: function(parts, locInfo) {
    this.loc = locInfo;
    this.type = "ID";

    var original = "",
        dig = [],
        depth = 0,
        depthString = '';

    for(var i=0,l=parts.length; i<l; i++) {
      var part = parts[i].part;
      original += (parts[i].separator || '') + part;

      if (part === ".." || part === "." || part === "this") {
        if (dig.length > 0) {
          throw new Exception("Invalid path: " + original, this);
        } else if (part === "..") {
          depth++;
          depthString += '../';
        } else {
          this.isScoped = true;
        }
      } else {
        dig.push(part);
      }
    }

    this.original = original;
    this.parts    = dig;
    this.string   = dig.join('.');
    this.depth    = depth;
    this.idName   = depthString + this.string;

    // an ID is simple if it only has one part, and that part is not
    // `..` or `this`.
    this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

    this.stringModeValue = this.string;
  },

  DataNode: function(id, locInfo) {
    this.loc = locInfo;
    this.type = "DATA";
    this.id = id;
    this.stringModeValue = id.stringModeValue;
    this.idName = '@' + id.stringModeValue;
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
  }
};


// Must be exported as an object rather than the root of the module as the jison lexer
// most modify the object to operate properly.
export default AST;
