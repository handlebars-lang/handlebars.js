%start root

%ebnf

%%

root
  : program EOF { yy.prepareProgram($1.statements, true); return $1; }
  ;

program
  : statement* -> new yy.ProgramNode(yy.prepareProgram($1), {}, @$)
  ;

statement
  : mustache -> $1
  | block -> $1
  | rawBlock -> $1
  | partial -> $1
  | CONTENT -> new yy.ContentNode($1, @$)
  | COMMENT -> new yy.CommentNode($1, @$)
  ;

rawBlock
  : openRawBlock CONTENT END_RAW_BLOCK -> new yy.RawBlockNode($1, $2, $3, @$)
  ;

openRawBlock
  : OPEN_RAW_BLOCK sexpr CLOSE_RAW_BLOCK -> new yy.MustacheNode($2, null, '', '', @$)
  ;

block
  : openBlock program inverseAndProgram? closeBlock -> yy.prepareBlock($1, $2, $3, $4, false, @$)
  | openInverse program inverseAndProgram? closeBlock -> yy.prepareBlock($1, $2, $3, $4, true, @$)
  ;

openBlock
  : OPEN_BLOCK sexpr CLOSE -> new yy.MustacheNode($2, null, $1, yy.stripFlags($1, $3), @$)
  ;

openInverse
  : OPEN_INVERSE sexpr CLOSE -> new yy.MustacheNode($2, null, $1, yy.stripFlags($1, $3), @$)
  ;

inverseAndProgram
  : INVERSE program -> { strip: yy.stripFlags($1, $1), program: $2 }
  ;

closeBlock
  : OPEN_ENDBLOCK path CLOSE -> {path: $2, strip: yy.stripFlags($1, $3)}
  ;

mustache
  // Parsing out the '&' escape token at AST level saves ~500 bytes after min due to the removal of one parser node.
  // This also allows for handler unification as all mustache node instances can utilize the same handler
  : OPEN sexpr CLOSE -> new yy.MustacheNode($2, null, $1, yy.stripFlags($1, $3), @$)
  | OPEN_UNESCAPED sexpr CLOSE_UNESCAPED -> new yy.MustacheNode($2, null, $1, yy.stripFlags($1, $3), @$)
  ;

partial
  : OPEN_PARTIAL partialName param hash? CLOSE -> new yy.PartialNode($2, $3, $4, yy.stripFlags($1, $5), @$)
  | OPEN_PARTIAL partialName hash? CLOSE -> new yy.PartialNode($2, undefined, $3, yy.stripFlags($1, $4), @$)
  ;

sexpr
  : path param* hash? -> new yy.SexprNode([$1].concat($2), $3, @$)
  | dataName -> new yy.SexprNode([$1], null, @$)
  ;

param
  : path -> $1
  | STRING -> new yy.StringNode($1, @$)
  | NUMBER -> new yy.NumberNode($1, @$)
  | BOOLEAN -> new yy.BooleanNode($1, @$)
  | dataName -> $1
  | OPEN_SEXPR sexpr CLOSE_SEXPR {$2.isHelper = true; $$ = $2;}
  ;

hash
  : hashSegment+ -> new yy.HashNode($1, @$)
  ;

hashSegment
  : ID EQUALS param -> [$1, $3]
  ;

partialName
  : path -> new yy.PartialNameNode($1, @$)
  | STRING -> new yy.PartialNameNode(new yy.StringNode($1, @$), @$)
  | NUMBER -> new yy.PartialNameNode(new yy.NumberNode($1, @$))
  ;

dataName
  : DATA path -> new yy.DataNode($2, @$)
  ;

path
  : pathSegments -> new yy.IdNode($1, @$)
  ;

pathSegments
  : pathSegments SEP ID { $1.push({part: $3, separator: $2}); $$ = $1; }
  | ID -> [{part: $1}]
  ;

