import parser from "./parser";
import AST from "./ast";
module Helpers from "./helpers";
import { extend } from "../utils";

export { parser };

var yy = {};
extend(yy, Helpers, AST);

export function parse(input, options) {
  // Just return if an already-compile AST was passed in.
  if (input.constructor === AST.ProgramNode) { return input; }

  parser.yy = yy;

  // Altering the shared object here, but this is ok as parser is a sync operation
  yy.locInfo = function(locInfo) {
    return new yy.SourceLocation(options && options.srcName, locInfo);
  };

  return parser.parse(input);
}
