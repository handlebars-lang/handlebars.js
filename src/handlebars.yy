%start root

%ebnf

%%

root
  : program EOF { return $1; }
  ;

program
  : statement* -> new yy.Program($1, null, {}, yy.locInfo(@$))
  ;

statement
  : mustache -> $1
  | block -> $1
  | rawBlock -> $1
  | partial -> $1
  | content -> $1
  | COMMENT -> new yy.CommentStatement(yy.stripComment($1), yy.stripFlags($1, $1), yy.locInfo(@$))
  ;

content
  : CONTENT -> new yy.ContentStatement($1, yy.locInfo(@$))
  ;

rawBlock
  : openRawBlock content END_RAW_BLOCK -> yy.prepareRawBlock($1, $2, $3, @$)
  ;

openRawBlock
  : OPEN_RAW_BLOCK sexpr CLOSE_RAW_BLOCK -> { sexpr: $2 }
  ;

block
  : openBlock program inverseChain? closeBlock -> yy.prepareBlock($1, $2, $3, $4, false, @$)
  | openInverse program inverseAndProgram? closeBlock -> yy.prepareBlock($1, $2, $3, $4, true, @$)
  ;

openBlock
  : OPEN_BLOCK sexpr blockParams? CLOSE -> { sexpr: $2, blockParams: $3, strip: yy.stripFlags($1, $4) }
  ;

openInverse
  : OPEN_INVERSE sexpr blockParams? CLOSE -> { sexpr: $2, blockParams: $3, strip: yy.stripFlags($1, $4) }
  ;

openInverseChain
  : OPEN_INVERSE_CHAIN sexpr blockParams? CLOSE -> { sexpr: $2, blockParams: $3, strip: yy.stripFlags($1, $4) }
  ;

inverseAndProgram
  : INVERSE program -> { strip: yy.stripFlags($1, $1), program: $2 }
  ;

inverseChain
  : openInverseChain program inverseChain? {
    var inverse = yy.prepareBlock($1, $2, $3, $3, false, @$),
        program = new yy.Program([inverse], null, {}, yy.locInfo(@$));
    program.chained = true;

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
  : OPEN sexpr CLOSE -> yy.prepareMustache($2, $1, yy.stripFlags($1, $3), @$)
  | OPEN_UNESCAPED sexpr CLOSE_UNESCAPED -> yy.prepareMustache($2, $1, yy.stripFlags($1, $3), @$)
  ;

partial
  : OPEN_PARTIAL sexpr CLOSE -> new yy.PartialStatement($2, yy.stripFlags($1, $3), yy.locInfo(@$))
  ;

sexpr
  : helperName param* hash? -> new yy.SubExpression($1, $2, $3, yy.locInfo(@$))
  | dataName -> new yy.SubExpression($1, null, null, yy.locInfo(@$))
  ;

param
  : path -> $1
  | STRING -> new yy.StringLiteral($1, yy.locInfo(@$))
  | NUMBER -> new yy.NumberLiteral($1, yy.locInfo(@$))
  | BOOLEAN -> new yy.BooleanLiteral($1, yy.locInfo(@$))
  | dataName -> $1
  | OPEN_SEXPR sexpr CLOSE_SEXPR -> $2
  ;

hash
  : hashSegment+ -> new yy.Hash($1, yy.locInfo(@$))
  ;

hashSegment
  : ID EQUALS param -> new yy.HashPair($1, $3, yy.locInfo(@$))
  ;

blockParams
  : OPEN_BLOCK_PARAMS ID+ CLOSE_BLOCK_PARAMS -> $2
  ;

helperName
  : path -> $1
  | STRING -> new yy.StringLiteral($1, yy.locInfo(@$)), yy.locInfo(@$)
  | NUMBER -> new yy.NumberLiteral($1, yy.locInfo(@$))
  ;

dataName
  : DATA pathSegments -> yy.preparePath(true, $2, @$)
  ;

path
  : pathSegments -> yy.preparePath(false, $1, @$)
  ;

pathSegments
  : pathSegments SEP ID { $1.push({part: $3, separator: $2}); $$ = $1; }
  | ID -> [{part: $1}]
  ;
