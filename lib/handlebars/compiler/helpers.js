import Exception from "../exception";

export function stripFlags(open, close) {
  return {
    left: open.charAt(2) === '~',
    right: close.charAt(close.length-3) === '~'
  };
}

export function stripComment(comment) {
  return comment.replace(/^\{\{~?\!-?-?/, '')
                .replace(/-?-?~?\}\}$/, '');
}

export function prepareRawBlock(openRawBlock, content, close, locInfo) {
  /*jshint -W040 */
  if (openRawBlock.sexpr.id.original !== close) {
    var errorNode = {
      firstLine: openRawBlock.sexpr.firstLine,
      firstColumn: openRawBlock.sexpr.firstColumn
    };

    throw new Exception(openRawBlock.sexpr.id.original + " doesn't match " + close, errorNode);
  }

  var program = new this.ProgramNode([content], {}, locInfo);

  return new this.BlockNode(openRawBlock.sexpr, program, undefined, undefined, locInfo);
}

export function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
  /*jshint -W040 */
  // When we are chaining inverse calls, we will not have a close path
  if (close && close.path && openBlock.sexpr.id.original !== close.path.original) {
    var errorNode = {
      firstLine: openBlock.sexpr.firstLine,
      firstColumn: openBlock.sexpr.firstColumn
    };

    throw new Exception(openBlock.sexpr.id.original + ' doesn\'t match ' + close.path.original, errorNode);
  }

  // Safely handle a chained inverse that does not have a non-conditional inverse
  // (i.e. both inverseAndProgram AND close are undefined)
  if (!close) {
    close = {strip: {}};
  }

  // Find the inverse program that is involed with whitespace stripping.
  var inverse = inverseAndProgram && inverseAndProgram.program,
      firstInverse = inverse,
      lastInverse = inverse;
  if (inverse && inverse.inverse) {
    firstInverse = inverse.statements[0].program;

    // Walk the inverse chain to find the last inverse that is actually in the chain.
    while (lastInverse.inverse) {
      lastInverse = lastInverse.statements[lastInverse.statements.length-1].program;
    }
  }

  var strip = {
    left: openBlock.strip.left,
    right: close.strip.right,

    // Determine the standalone candiacy. Basically flag our content as being possibly standalone
    // so our parent can determine if we actually are standalone
    openStandalone: isNextWhitespace(program.statements),
    closeStandalone: isPrevWhitespace((firstInverse || program).statements)
  };

  if (openBlock.strip.right) {
    omitRight(program.statements, null, true);
  }

  if (inverse) {
    var inverseStrip = inverseAndProgram.strip;

    if (inverseStrip.left) {
      omitLeft(program.statements, null, true);
    }

    if (inverseStrip.right) {
      omitRight(firstInverse.statements, null, true);
    }
    if (close.strip.left) {
      omitLeft(lastInverse.statements, null, true);
    }

    // Find standalone else statments
    if (isPrevWhitespace(program.statements)
        && isNextWhitespace(firstInverse.statements)) {

      omitLeft(program.statements);
      omitRight(firstInverse.statements);
    }
  } else {
    if (close.strip.left) {
      omitLeft(program.statements, null, true);
    }
  }

  if (inverted) {
    return new this.BlockNode(openBlock.sexpr, inverse, program, strip, locInfo);
  } else {
    return new this.BlockNode(openBlock.sexpr, program, inverse, strip, locInfo);
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

    if (strip.right) {
      omitRight(statements, i, true);
    }
    if (strip.left) {
      omitLeft(statements, i, true);
    }

    if (inlineStandalone) {
      omitRight(statements, i);

      if (omitLeft(statements, i)) {
        // If we are on a standalone node, save the indent info for partials
        if (current.type === 'partial') {
          // Pull out the whitespace from the final line
          current.indent = (/([ \t]+$)/).exec(statements[i-1].original)[1];
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

function isPrevWhitespace(statements, i, isRoot) {
  if (i === undefined) {
    i = statements.length;
  }

  // Nodes that end with newlines are considered whitespace (but are special
  // cased for strip operations)
  var prev = statements[i-1],
      sibling = statements[i-2];
  if (!prev) {
    return isRoot;
  }

  if (prev.type === 'content') {
    return (sibling || !isRoot ? (/\r?\n\s*?$/) : (/(^|\r?\n)\s*?$/)).test(prev.original);
  }
}
function isNextWhitespace(statements, i, isRoot) {
  if (i === undefined) {
    i = -1;
  }

  var next = statements[i+1],
      sibling = statements[i+2];
  if (!next) {
    return isRoot;
  }

  if (next.type === 'content') {
    return (sibling || !isRoot ? (/^\s*?\r?\n/) : (/^\s*?(\r?\n|$)/)).test(next.original);
  }
}

// Marks the node to the right of the position as omitted.
// I.e. {{foo}}' ' will mark the ' ' node as omitted.
//
// If i is undefined, then the first child will be marked as such.
//
// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitRight(statements, i, multiple) {
  var current = statements[i == null ? 0 : i + 1];
  if (!current || current.type !== 'content' || (!multiple && current.rightStripped)) {
    return;
  }

  var original = current.string;
  current.string = current.string.replace(multiple ? (/^\s+/) : (/^[ \t]*\r?\n?/), '');
  current.rightStripped = current.string !== original;
}

// Marks the node to the left of the position as omitted.
// I.e. ' '{{foo}} will mark the ' ' node as omitted.
//
// If i is undefined then the last child will be marked as such.
//
// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitLeft(statements, i, multiple) {
  var current = statements[i == null ? statements.length - 1 : i - 1];
  if (!current || current.type !== 'content' || (!multiple && current.leftStripped)) {
    return;
  }

  // We omit the last node if it's whitespace only and not preceeded by a non-content node.
  var original = current.string;
  current.string = current.string.replace(multiple ? (/\s+$/) : (/[ \t]+$/), '');
  current.leftStripped = current.string !== original;
  return current.leftStripped;
}
