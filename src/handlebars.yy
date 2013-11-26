%start root

%ebnf

%{

function stripFlags(open, close) {
  return {
    left: open[2] === '~',
    right: close[0] === '~' || close[1] === '~'
  };
}

%}

%%

root
  : statements EOF { return new yy.ProgramNode($1); }
  | EOF { return new yy.ProgramNode([]); }
  ;

program
  : simpleInverse statements -> new yy.ProgramNode([], $1, $2)
  | statements simpleInverse statements -> new yy.ProgramNode($1, $2, $3)
  | statements simpleInverse -> new yy.ProgramNode($1, $2, [])
  | statements -> new yy.ProgramNode($1)
  | simpleInverse -> new yy.ProgramNode([])
  | "" -> new yy.ProgramNode([])
  ;

statements
  : statement -> [$1]
  | statements statement { $1.push($2); $$ = $1; }
  ;

statement
  : openInverse program closeBlock -> new yy.BlockNode($1, $2.inverse, $2, $3)
  | openBlock program closeBlock -> new yy.BlockNode($1, $2, $2.inverse, $3)
  | mustache -> $1
  | partial -> $1
  | CONTENT -> new yy.ContentNode($1)
  | COMMENT -> new yy.CommentNode($1)
  ;

openBlock
  : OPEN_BLOCK inMustache CLOSE -> new yy.MustacheNode($2[0], $2[1], $1, stripFlags($1, $3))
  ;

openInverse
  : OPEN_INVERSE inMustache CLOSE -> new yy.MustacheNode($2[0], $2[1], $1, stripFlags($1, $3))
  ;

closeBlock
  : OPEN_ENDBLOCK path CLOSE -> {path: $2, strip: stripFlags($1, $3)}
  ;

mustache
  // Parsing out the '&' escape token at AST level saves ~500 bytes after min due to the removal of one parser node.
  // This also allows for handler unification as all mustache node instances can utilize the same handler
  : OPEN inMustache CLOSE -> new yy.MustacheNode($2[0], $2[1], $1, stripFlags($1, $3))
  | OPEN_UNESCAPED inMustache CLOSE_UNESCAPED -> new yy.MustacheNode($2[0], $2[1], $1, stripFlags($1, $3))
  ;


partial
  : OPEN_PARTIAL partialName path? CLOSE -> new yy.PartialNode($2, $3, stripFlags($1, $4))
  ;

simpleInverse
  : OPEN_INVERSE CLOSE -> stripFlags($1, $2)
  ;

inMustache
  : path param* hash? -> [[$1].concat($2), $3]
  | path OPEN_PARENTHESIS commaSeparatedParams CLOSE_PARENTHESIS -> [[$1].concat($3), null]
  | path OPEN_PARENTHESIS commaSeparatedParams COMMA commaSeparatedHashes CLOSE_PARENTHESIS -> [[$1].concat($3), new yy.HashNode($5)]
  | path OPEN_PARENTHESIS commaSeparatedHashes CLOSE_PARENTHESIS -> [[$1], new yy.HashNode($3)]
  | dataName -> [[$1], null]
  ;

param
  : path -> $1
  | STRING -> new yy.StringNode($1)
  | INTEGER -> new yy.IntegerNode($1)
  | BOOLEAN -> new yy.BooleanNode($1)
  | dataName -> $1
  ;

commaSeparatedParams
  : param -> [$1]
  | commaSeparatedParams COMMA param -> $1.concat([$3])
  ;

hash
  : hashSegment+ -> new yy.HashNode($1)
  ;

hashSegment
  : ID EQUALS param -> [$1, $3]
  ;

commaSeparatedHashes
  : hashSegment -> [$1]
  | commaSeparatedHashes COMMA hashSegment -> $1.concat([$3])
  ;

partialName
  : path -> new yy.PartialNameNode($1)
  | STRING -> new yy.PartialNameNode(new yy.StringNode($1))
  | INTEGER -> new yy.PartialNameNode(new yy.IntegerNode($1))
  ;

dataName
  : DATA path -> new yy.DataNode($2)
  ;

path
  : pathSegments -> new yy.IdNode($1)
  ;

pathSegments
  : pathSegments SEP ID { $1.push({part: $3, separator: $2}); $$ = $1; }
  | ID -> [{part: $1}]
  ;

