import Exception from "../exception";
import AST from "./ast";

export function stripFlags(open, close) {
  return {
    left: open.charAt(2) === '~',
    right: close.charAt(close.length-3) === '~'
  };
}

export function prepareBlock(mustache, program, inverseAndProgram, close, inverted, locInfo) {
  if (mustache.sexpr.id.original !== close.path.original) {
    throw new Exception(mustache.sexpr.id.original + " doesn't match " + close.path.original, mustache);
  }

  var inverse, strip;

  strip = {
    left: mustache.strip.left,
    right: close.strip.right
  };

  if (inverseAndProgram) {
    inverse = inverseAndProgram.program;
    var inverseStrip = inverseAndProgram.strip;

    program.strip.left = mustache.strip.right;
    program.strip.right = inverseStrip.left;
    inverse.strip.left = inverseStrip.right;
    inverse.strip.right = close.strip.left;
  } else {
    program.strip.left = mustache.strip.right;
    program.strip.right = close.strip.left;
  }

  if (inverted) {
    return new AST.BlockNode(mustache, inverse, program, strip, locInfo);
  } else {
    return new AST.BlockNode(mustache, program, inverse, strip, locInfo);
  }
}
