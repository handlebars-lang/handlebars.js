import parser from "./parser";
import AST from "./ast";
import { stripFlags, prepareBlock } from "./helpers";

export { parser };

export function parse(input) {
  // Just return if an already-compile AST was passed in.
  if (input.constructor === AST.ProgramNode) { return input; }

  for (var key in AST) {
    parser.yy[key] = AST[key];
  }

  parser.yy.stripFlags = stripFlags;
  parser.yy.prepareBlock = prepareBlock;

  return parser.parse(input);
}
