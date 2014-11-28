import Exception from "../exception";

export function SourceLocation(source, locInfo) {
  this.source = source;
  this.start = {
    line: locInfo.first_line,
    column: locInfo.first_column
  };
  this.end = {
    line: locInfo.last_line,
    column: locInfo.last_column
  };
}

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

export function preparePath(data, parts, locInfo) {
  /*jshint -W040 */
  locInfo = this.locInfo(locInfo);

  var original = data ? '@' : '',
      dig = [],
      depth = 0,
      depthString = '';

  for(var i=0,l=parts.length; i<l; i++) {
    var part = parts[i].part;
    original += (parts[i].separator || '') + part;

    if (part === '..' || part === '.' || part === 'this') {
      if (dig.length > 0) {
        throw new Exception('Invalid path: ' + original, {loc: locInfo});
      } else if (part === '..') {
        depth++;
        depthString += '../';
      }
    } else {
      dig.push(part);
    }
  }

  return new this.PathExpression(data, depth, dig, original, locInfo);
}

export function prepareMustache(sexpr, open, strip, locInfo) {
  /*jshint -W040 */
  // Must use charAt to support IE pre-10
  var escapeFlag = open.charAt(3) || open.charAt(2),
      escaped = escapeFlag !== '{' && escapeFlag !== '&';

  return new this.MustacheStatement(sexpr, escaped, strip, this.locInfo(locInfo));
}

export function prepareRawBlock(openRawBlock, content, close, locInfo) {
  /*jshint -W040 */
  if (openRawBlock.sexpr.path.original !== close) {
    var errorNode = {loc: openRawBlock.sexpr.loc};

    throw new Exception(openRawBlock.sexpr.path.original + " doesn't match " + close, errorNode);
  }

  var program = new this.Program([content], null, {}, locInfo);

  return new this.BlockStatement(openRawBlock.sexpr, program, undefined, undefined, locInfo);
}

export function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
  /*jshint -W040 */
  // When we are chaining inverse calls, we will not have a close path
  if (close && close.path && openBlock.sexpr.path.original !== close.path.original) {
    var errorNode = {loc: openBlock.sexpr.loc};

    throw new Exception(openBlock.sexpr.path.original + ' doesn\'t match ' + close.path.original, errorNode);
  }

  program.blockParams = openBlock.blockParams;

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
    firstInverse = inverse.body[0].program;

    // Walk the inverse chain to find the last inverse that is actually in the chain.
    while (lastInverse.inverse) {
      lastInverse = lastInverse.body[lastInverse.body.length-1].program;
    }
  }

  var strip = {
    left: openBlock.strip.left,
    right: close.strip.right,

    // Determine the standalone candiacy. Basically flag our content as being possibly standalone
    // so our parent can determine if we actually are standalone
    openStandalone: isNextWhitespace(program.body),
    closeStandalone: isPrevWhitespace((firstInverse || program).body)
  };

  if (openBlock.strip.right) {
    omitRight(program.body, null, true);
  }

  if (inverse) {
    var inverseStrip = inverseAndProgram.strip;

    if (inverseStrip.left) {
      omitLeft(program.body, null, true);
    }

    if (inverseStrip.right) {
      omitRight(firstInverse.body, null, true);
    }
    if (close.strip.left) {
      omitLeft(lastInverse.body, null, true);
    }

    // Find standalone else statments
    if (isPrevWhitespace(program.body)
        && isNextWhitespace(firstInverse.body)) {

      omitLeft(program.body);
      omitRight(firstInverse.body);
    }
  } else {
    if (close.strip.left) {
      omitLeft(program.body, null, true);
    }
  }

  if (inverted) {
    return new this.BlockStatement(openBlock.sexpr, inverse, program, strip, locInfo);
  } else {
    return new this.BlockStatement(openBlock.sexpr, program, inverse, strip, locInfo);
  }
}


export function prepareProgram(body, isRoot) {
  for (var i = 0, l = body.length; i < l; i++) {
    var current = body[i],
        strip = current.strip;

    if (!strip) {
      continue;
    }

    var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot, current.type === 'partial'),
        _isNextWhitespace = isNextWhitespace(body, i, isRoot),

        openStandalone = strip.openStandalone && _isPrevWhitespace,
        closeStandalone = strip.closeStandalone && _isNextWhitespace,
        inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

    if (strip.right) {
      omitRight(body, i, true);
    }
    if (strip.left) {
      omitLeft(body, i, true);
    }

    if (inlineStandalone) {
      omitRight(body, i);

      if (omitLeft(body, i)) {
        // If we are on a standalone node, save the indent info for partials
        if (current.type === 'PartialStatement') {
          // Pull out the whitespace from the final line
          current.indent = (/([ \t]+$)/).exec(body[i-1].original)[1];
        }
      }
    }
    if (openStandalone) {
      omitRight((current.program || current.inverse).body);

      // Strip out the previous content node if it's whitespace only
      omitLeft(body, i);
    }
    if (closeStandalone) {
      // Always strip the next node
      omitRight(body, i);

      omitLeft((current.inverse || current.program).body);
    }
  }

  return body;
}

function isPrevWhitespace(body, i, isRoot) {
  if (i === undefined) {
    i = body.length;
  }

  // Nodes that end with newlines are considered whitespace (but are special
  // cased for strip operations)
  var prev = body[i-1],
      sibling = body[i-2];
  if (!prev) {
    return isRoot;
  }

  if (prev.type === 'ContentStatement') {
    return (sibling || !isRoot ? (/\r?\n\s*?$/) : (/(^|\r?\n)\s*?$/)).test(prev.original);
  }
}
function isNextWhitespace(body, i, isRoot) {
  if (i === undefined) {
    i = -1;
  }

  var next = body[i+1],
      sibling = body[i+2];
  if (!next) {
    return isRoot;
  }

  if (next.type === 'ContentStatement') {
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
function omitRight(body, i, multiple) {
  var current = body[i == null ? 0 : i + 1];
  if (!current || current.type !== 'ContentStatement' || (!multiple && current.rightStripped)) {
    return;
  }

  var original = current.value;
  current.value = current.value.replace(multiple ? (/^\s+/) : (/^[ \t]*\r?\n?/), '');
  current.rightStripped = current.value !== original;
}

// Marks the node to the left of the position as omitted.
// I.e. ' '{{foo}} will mark the ' ' node as omitted.
//
// If i is undefined then the last child will be marked as such.
//
// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitLeft(body, i, multiple) {
  var current = body[i == null ? body.length - 1 : i - 1];
  if (!current || current.type !== 'ContentStatement' || (!multiple && current.leftStripped)) {
    return;
  }

  // We omit the last node if it's whitespace only and not preceeded by a non-content node.
  var original = current.value;
  current.value = current.value.replace(multiple ? (/\s+$/) : (/[ \t]+$/), '');
  current.leftStripped = current.value !== original;
  return current.leftStripped;
}
