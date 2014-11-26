%start root

%ebnf

%%

root
  : program EOF { yy.prepareProgram($1.statements, true); return $1; }
  ;

program
  : statement* -> new yy.ProgramNode(yy.prepareProgram($1), null, {}, yy.locInfo(@$))
  ;

statement
  : mustache -> $1
  | block -> $1
  | rawBlock -> $1
  | partial -> $1
  | content -> $1
  | COMMENT -> new yy.CommentNode(yy.stripComment($1), yy.stripFlags($1, $1), yy.locInfo(@$))
  ;

content
  : CONTENT -> new yy.ContentNode($1, yy.locInfo(@$))
  ;

rawBlock
  : openRawBlock content END_RAW_BLOCK -> yy.prepareRawBlock($1, $2, $3, yy.locInfo(@$))
  ;

openRawBlock
  : OPEN_RAW_BLOCK sexpr CLOSE_RAW_BLOCK -> { sexpr: $2 }
  ;

block
  : openBlock program inverseChain? closeBlock -> yy.prepareBlock($1, $2, $3, $4, false, yy.locInfo(@$))
  | openInverse program inverseAndProgram? closeBlock -> yy.prepareBlock($1, $2, $3, $4, true, yy.locInfo(@$))
  ;

openBlock
  : OPEN_BLOCK sexpr blockParams? CLOSE -> { sexpr: $2, blockParams: $3, strip: yy.stripFlags($1, $4) }
  ;

openInverse
  : OPEN_INVERSE sexpr blockParams? CLOSE -> { sexpr: $2, blockParams: $3, strip: yy.stripFlags($1, $4) }
  ;

openInverseChain
  : OPEN_INVERSE_CHAIN sexpr CLOSE -> new yy.MustacheNode($2, null, $1, yy.stripFlags($1, $3), yy.locInfo(@$))
  ;

inverseAndProgram
  : INVERSE program -> { strip: yy.stripFlags($1, $1), program: $2 }
  ;

inverseChain
  : openInverseChain program inverseChain? {
    var inverse = yy.prepareBlock($1, $2, $3, $3, false, yy.locInfo(@$)),
        program = new yy.ProgramNode(yy.prepareProgram([inverse]), null, {}, yy.locInfo(@$));

    program.inverse = inverse;

    $$ = { strip: $1.strip, program: program, chain: true };
  }
  | inverseAndProgram -> $1
  ;

closeBlock
  : OPEN_ENDBLOCK path CLOSE -> {path: $2, strip: yy.stripFlags($1, $3)}
  ;

mustache
  // Parsing out the '&' escape token at AST level saves ~500 bytes after min due to the removal of one parser node.
  // This also allows for handler unification as all mustache node instances can utilize the same handler
  : OPEN sexpr CLOSE -> new yy.MustacheNode($2, null, $1, yy.stripFlags($1, $3), yy.locInfo(@$))
  | OPEN_UNESCAPED sexpr CLOSE_UNESCAPED -> new yy.MustacheNode($2, null, $1, yy.stripFlags($1, $3), yy.locInfo(@$))
  ;

partial
  : OPEN_PARTIAL partialName param hash? CLOSE -> new yy.PartialNode($2, $3, $4, yy.stripFlags($1, $5), yy.locInfo(@$))
  | OPEN_PARTIAL partialName hash? CLOSE -> new yy.PartialNode($2, undefined, $3, yy.stripFlags($1, $4), yy.locInfo(@$))
  ;

sexpr
  : path param* hash? -> new yy.SexprNode([$1].concat($2), $3, yy.locInfo(@$))
  | dataName -> new yy.SexprNode([$1], null, yy.locInfo(@$))
  ;

param
  : path -> $1
  | STRING -> new yy.StringNode($1, yy.locInfo(@$))
  | NUMBER -> new yy.NumberNode($1, yy.locInfo(@$))
  | BOOLEAN -> new yy.BooleanNode($1, yy.locInfo(@$))
  | dataName -> $1
  | OPEN_SEXPR sexpr CLOSE_SEXPR {$2.isHelper = true; $$ = $2;}
  ;

hash
  : hashSegment+ -> new yy.HashNode($1, yy.locInfo(@$))
  ;

hashSegment
  : ID EQUALS param -> [$1, $3]
  ;

blockParams
  : OPEN_BLOCK_PARAMS ID+ CLOSE_BLOCK_PARAMS -> $2
  ;

partialName
  : path -> new yy.PartialNameNode($1, yy.locInfo(@$))
  | STRING -> new yy.PartialNameNode(new yy.StringNode($1, yy.locInfo(@$)), yy.locInfo(@$))
  | NUMBER -> new yy.PartialNameNode(new yy.NumberNode($1, yy.locInfo(@$)))
  ;

dataName
  : DATA path -> new yy.DataNode($2, yy.locInfo(@$))
  ;

path
  : pathSegments -> new yy.IdNode($1, yy.locInfo(@$))
  ;

pathSegments
  : pathSegments SEP ID { $1.push({part: $3, separator: $2}); $$ = $1; }
  | ID -> [{part: $1}]
  ;
