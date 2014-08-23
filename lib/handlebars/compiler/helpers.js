import Exception from "../exception";

export function stripFlags(open, close) {
  return {
    left: open.charAt(2) === '~',
    right: close.charAt(close.length-3) === '~'
  };
}


export function prepareBlock(mustache, program, inverseAndProgram, close, inverted, locInfo) {
  /*jshint -W040 */
  if (mustache.sexpr.id.original !== close.path.original) {
    throw new Exception(mustache.sexpr.id.original + ' doesn\'t match ' + close.path.original, mustache);
  }

  var inverse = inverseAndProgram && inverseAndProgram.program;

  var strip = {
    left: mustache.strip.left,
    right: close.strip.right,

    // Determine the standalone candiacy. Basically flag our content as being possibly standalone
    // so our parent can determine if we actually are standalone
    openStandalone: isNextWhitespace(program.statements),
    closeStandalone: isPrevWhitespace((inverse || program).statements)
  };

  if (inverse) {
    var inverseStrip = inverseAndProgram.strip;

    program.strip.left = mustache.strip.right;
    program.strip.right = inverseStrip.left;
    inverse.strip.left = inverseStrip.right;
    inverse.strip.right = close.strip.left;

    // Find standalone else statments
    if (isPrevWhitespace(program.statements)
        && isNextWhitespace(inverse.statements)) {

      omitLeft(program.statements);
      omitRight(inverse.statements);
    }
  } else {
    program.strip.left = mustache.strip.right;
    program.strip.right = close.strip.left;
  }

  if (inverted) {
    return new this.BlockNode(mustache, inverse, program, strip, locInfo);
  } else {
    return new this.BlockNode(mustache, program, inverse, strip, locInfo);
  }
}


export function prepareProgram(statements, isRoot) {
  for (var i = 0, l = statements.length; i < l; i++) {
    var current = statements[i],
        strip = current.strip;

    if (!strip) {
      continue;
    }

    var _isPrevWhitespace = isPrevWhitespace(statements, i, isRoot, current.type === 'partial'),
        _isNextWhitespace = isNextWhitespace(statements, i, isRoot),

        openStandalone = strip.openStandalone && _isPrevWhitespace,
        closeStandalone = strip.closeStandalone && _isNextWhitespace,
        inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

    if (inlineStandalone) {
      omitRight(statements, i);

      if (omitLeft(statements, i)) {
        // If we are on a standalone node, save the indent info for partials
        if (current.type === 'partial') {
          current.indent = statements[i-1].original;
        }
      }
    }
    if (openStandalone) {
      omitRight((current.program || current.inverse).statements);

      // Strip out the previous content node if it's whitespace only
      omitLeft(statements, i);
    }
    if (closeStandalone) {
      // Always strip the next node
      omitRight(statements, i);

      omitLeft((current.inverse || current.program).statements);
    }
  }

  return statements;
}

function isPrevWhitespace(statements, i, isRoot, disallowIndent) {
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
function isNextWhitespace(statements, i, isRoot) {
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
// I.e. {{foo}}' ' will mark the ' ' node as omitted.
//
// If i is undefined, then the first child will be marked as such.
function omitRight(statements, i) {
  var first = statements[i == null ? 0 : i + 1];
  if (first) {
    first.string = '';
  }
}

// Marks the node to the left of the position as omitted.
// I.e. ' '{{foo}} will mark the ' ' node as omitted.
//
// If i is undefined then the last child will be marked as such.
function omitLeft(statements, i) {
  if (i === undefined) {
    i = statements.length;
  }

  var last = statements[i-1],
      prev = statements[i-2];

  // We omit the last node if it's whitespace only and not preceeded by a non-content node.
  if (last && /^[\s]*$/.test(last.string) && (!prev || prev.type === 'content')) {
    last.string = '';
    return true;
  }
}
