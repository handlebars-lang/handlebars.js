import Exception from "../exception";

function LocationInfo(locInfo){
  locInfo = locInfo || {};
  this.firstLine   = locInfo.first_line;
  this.firstColumn = locInfo.first_column;
  this.lastColumn  = locInfo.last_column;
  this.lastLine    = locInfo.last_line;
}

var AST = {
  ProgramNode: function(isRoot, statements, inverseStrip, inverse, locInfo) {
    var inverseLocationInfo, firstInverseNode;
    if (arguments.length === 4) {
      locInfo = inverse;
      inverse = null;
    } else if (arguments.length === 3) {
      locInfo = inverseStrip;
      inverseStrip = null;
    }

    LocationInfo.call(this, locInfo);
    this.type = "program";
    this.statements = statements;
    this.strip = {};

    if(inverse) {
      firstInverseNode = inverse[0];
      if (firstInverseNode) {
        inverseLocationInfo = {
          first_line: firstInverseNode.firstLine,
          last_line: firstInverseNode.lastLine,
          last_column: firstInverseNode.lastColumn,
          first_column: firstInverseNode.firstColumn
        };
        this.inverse = new AST.ProgramNode(isRoot, inverse, inverseStrip, inverseLocationInfo);
      } else {
        this.inverse = new AST.ProgramNode(isRoot, inverse, inverseStrip);
      }
      this.strip.right = inverseStrip.left;
    } else if (inverseStrip) {
      this.strip.left = inverseStrip.right;
    }

    // Scan all children to complete the standalone analysis
    checkStandalone(this, isRoot, statements);
  },

  MustacheNode: function(rawParams, hash, open, strip, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "mustache";
    this.strip = strip;

    // Open may be a string parsed from the parser or a passed boolean flag
    if (open != null && open.charAt) {
      // Must use charAt to support IE pre-10
      var escapeFlag = open.charAt(3) || open.charAt(2);
      this.escaped = escapeFlag !== '{' && escapeFlag !== '&';
    } else {
      this.escaped = !!open;
    }

    if (rawParams instanceof AST.SexprNode) {
      this.sexpr = rawParams;
    } else {
      // Support old AST API
      this.sexpr = new AST.SexprNode(rawParams, hash);
    }

    this.sexpr.isRoot = true;

    // Support old AST API that stored this info in MustacheNode
    this.id = this.sexpr.id;
    this.params = this.sexpr.params;
    this.hash = this.sexpr.hash;
    this.eligibleHelper = this.sexpr.eligibleHelper;
    this.isHelper = this.sexpr.isHelper;
  },

  SexprNode: function(rawParams, hash, locInfo) {
    LocationInfo.call(this, locInfo);

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

  PartialNode: function(partialName, context, hash, strip, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type         = "partial";
    this.partialName  = partialName;
    this.context      = context;
    this.hash = hash;
    this.strip = strip;

    this.strip.inlineStandalone = true;
  },

  BlockNode: function(mustache, program, inverse, close, locInfo) {
    LocationInfo.call(this, locInfo);

    if(mustache.sexpr.id.original !== close.path.original) {
      throw new Exception(mustache.sexpr.id.original + " doesn't match " + close.path.original, this);
    }

    this.type = 'block';
    this.mustache = mustache;
    this.program  = program;
    this.inverse  = inverse;

    var firstChild = program || inverse,
        lastChild = inverse || program;

    this.strip = {
      left: mustache.strip.left,
      right: close.strip.right,

      // Determine the standalone candiacy. Basically flag our content as being possibly standalone
      // so our parent can determine if we actually are standalone
      openStandalone: isNextWhitespace(firstChild),
      closeStandalone: isPrevWhitespace(lastChild)
    };

    // Calculate stripping for any else statements
    firstChild.strip.left = mustache.strip.right;
    lastChild.strip.right = close.strip.left;

    // Find standalone else statments
    if (program && inverse
        && isPrevWhitespace(program)
        && isNextWhitespace(inverse)) {

      omitLeft(program);
      omitRight(inverse);
    }

    if (inverse && !program) {
      this.isInverse = true;
    }
  },

  RawBlockNode: function(mustache, content, close, locInfo) {
    LocationInfo.call(this, locInfo);

    if (mustache.sexpr.id.original !== close) {
      throw new Exception(mustache.sexpr.id.original + " doesn't match " + close, this);
    }

    content = new AST.ContentNode(content, locInfo);

    this.type = 'block';
    this.mustache = mustache;
    this.program = new AST.ProgramNode(false, [content], locInfo);
  },

  ContentNode: function(string, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "content";
    this.string = string;
  },

  HashNode: function(pairs, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "hash";
    this.pairs = pairs;
  },

  IdNode: function(parts, locInfo) {
    LocationInfo.call(this, locInfo);
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

  PartialNameNode: function(name, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "PARTIAL_NAME";
    this.name = name.original;
  },

  DataNode: function(id, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "DATA";
    this.id = id;
    this.stringModeValue = id.stringModeValue;
    this.idName = '@' + id.stringModeValue;
  },

  StringNode: function(string, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "STRING";
    this.original =
      this.string =
      this.stringModeValue = string;
  },

  NumberNode: function(number, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "NUMBER";
    this.original =
      this.number = number;
    this.stringModeValue = Number(number);
  },

  BooleanNode: function(bool, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "BOOLEAN";
    this.bool = bool;
    this.stringModeValue = bool === "true";
  },

  CommentNode: function(comment, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "comment";
    this.comment = comment;

    this.strip = {
      inlineStandalone: true
    };
  }
};


function checkStandalone(program, isRoot, statements) {
  for (var i = 0, l = statements.length; i < l; i++) {
    var current = statements[i],
        strip = current.strip;

    if (!strip) {
      continue;
    }

    var _isPrevWhitespace = isPrevWhitespace(program, i, isRoot, current.type === 'partial'),
        _isNextWhitespace = isNextWhitespace(program, i, isRoot);
    strip.openStandalone = strip.openStandalone && _isPrevWhitespace;
    strip.closeStandalone = strip.closeStandalone && _isNextWhitespace;
    strip.inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

    if (strip.inlineStandalone) {
      omitRight(program, i);

      if (omitLeft(program, i)) {
        // If we are on a standalone node, save the indent info for partials
        if (current.type === 'partial') {
          current.indent = statements[i-1].string;
        }
      }
    }
    if (strip.openStandalone) {
      omitRight(current.program || current.inverse);

      // Strip out the previous content node if it's whitespace only
      omitLeft(program, i);
    }
    if (strip.closeStandalone) {
      // Always strip the next node
      omitRight(program, i);

      omitLeft(current.inverse || current.program);
    }
  }
}
function isPrevWhitespace(parent, i, isRoot, disallowIndent) {
  var statements = parent.statements;
  if (i === undefined) {
    i = statements.length;
  }

  // Nodes that end with newlines are considered whitespace (but are special
  // cased for strip operations)
  var prev = statements[i-1];
  if (prev && /\n$/.test(prev.string)) {
    return true;
  }

  return checkWhitespace(isRoot, prev, statements[i-2]);
}
function isNextWhitespace(parent, i, isRoot) {
  var statements = parent.statements;
  if (i === undefined) {
    i = -1;
  }

  return checkWhitespace(isRoot, statements[i+1], statements[i+2]);
}
function checkWhitespace(isRoot, next1, next2, disallowIndent) {
  if (!next1) {
    return isRoot;
  } else if (next1.type === 'content') {
    // Check if the previous node is empty or whitespace only
    if (disallowIndent ? !next1.string : /^[\s]*$/.test(next1.string)) {
      if (next2) {
        return next2.type === 'content' || /\n$/.test(next1.string);
      } else {
        return isRoot || (next1.string.indexOf('\n') >= 0);
      }
    }
  }
}

// Marks the node to the right of the position as omitted.
// I.e. " "{{foo}} will mark the " " node as omitted.
//
// If i is undefined, then the first child will be marked as such.
function omitRight(program, i) {
  var first = program.statements[i == null ? 0 : i + 1];
  if (first) {
    first.omit = true;
  }
}

// Marks the node to the left of the position as omitted.
// I.e. " "{{foo}} will mark the " " node as omitted.
//
// If i is undefined then the last child will be marked as such.
function omitLeft(program, i) {
  var statements = program.statements;
  if (i === undefined) {
    i = statements.length;
  }

  var last = statements[i-1],
      prev = statements[i-2];

  // We omit the last node if it's whitespace only and not preceeded by a non-content node.
  if (last && /^[\s]*$/.test(last.string) && (!prev || prev.type === 'content')) {
    return last.omit = true;
  }
}

// Must be exported as an object rather than the root of the module as the jison lexer
// most modify the object to operate properly.
export default AST;
