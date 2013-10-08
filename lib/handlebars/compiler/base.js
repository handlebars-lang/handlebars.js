import parser from "handlebars/compiler/parser";
import AST from "handlebars/compiler/ast";

export { parser };

export function parse(input) {
  // Just return if an already-compile AST was passed in.
  if(input.constructor === AST.ProgramNode) { return input; }

  parser.yy = AST;
  return parser.parse(input);
}

