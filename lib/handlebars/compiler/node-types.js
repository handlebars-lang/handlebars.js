// AST node types produced by the parser. Compiler#accept dispatches on the
// untrusted `node.type`, so it only accepts these types and must never call
// any other method of the compiler.
export const NODE_TYPES = [
  'Program',
  'BlockStatement',
  'DecoratorBlock',
  'PartialStatement',
  'PartialBlockStatement',
  'Decorator',
  'MustacheStatement',
  'ContentStatement',
  'CommentStatement',
  'SubExpression',
  'PathExpression',
  'StringLiteral',
  'NumberLiteral',
  'BooleanLiteral',
  'UndefinedLiteral',
  'NullLiteral',
  'Hash',
  'HashPair',
];
