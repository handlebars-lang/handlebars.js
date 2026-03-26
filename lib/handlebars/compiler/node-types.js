// AST node types produced by the parser. Visitor#accept and Compiler#accept
// dispatch on the untrusted `node.type`, so they must never call any other
// method of the visiting object. The Compiler only accepts these types; a
// Visitor also accepts types for which a subclass defines its own handler.
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
  'HashPair'
];
