%start root

%ebnf

%%

root
  : program EOF { return $1; }
  ;

program
  : statement* -> yy.prepareProgram($1)
  ;

statement
  : mustache -> $1
  | block -> $1
  | rawBlock -> $1
  | partial -> $1
  | partialBlock -> $1
  | content -> $1
  | COMMENT {
    $$ = {
      type: 'CommentStatement',
      value: yy.stripComment($1),
      strip: yy.stripFlags($1, $1),
      loc: yy.locInfo(@$)
    };
  };

content
  : CONTENT {
    $$ = {
      type: 'ContentStatement',
      original: $1,
      value: $1,
      loc: yy.locInfo(@$)
    };
  };

rawBlock
  : openRawBlock content* END_RAW_BLOCK -> yy.prepareRawBlock($1, $2, $3, @$)
  ;

openRawBlock
  : OPEN_RAW_BLOCK helperName param* hash? CLOSE_RAW_BLOCK -> { path: $2, params: $3, hash: $4 }
  ;

block
  : openBlock program inverseChain? closeBlock -> yy.prepareBlock($1, $2, $3, $4, false, @$)
  | openInverse program inverseAndProgram? closeBlock -> yy.prepareBlock($1, $2, $3, $4, true, @$)
  ;

openBlock
  : OPEN_BLOCK helperName param* hash? blockParams? CLOSE -> { open: $1, path: $2, params: $3, hash: $4, blockParams: $5, strip: yy.stripFlags($1, $6) }
  ;

openInverse
  : OPEN_INVERSE helperName param* hash? blockParams? CLOSE -> { path: $2, params: $3, hash: $4, blockParams: $5, strip: yy.stripFlags($1, $6) }
  ;

openInverseChain
  : OPEN_INVERSE_CHAIN helperName param* hash? blockParams? CLOSE -> { path: $2, params: $3, hash: $4, blockParams: $5, strip: yy.stripFlags($1, $6) }
  ;

inverseAndProgram
  : INVERSE program -> { strip: yy.stripFlags($1, $1), program: $2 }
  ;

inverseChain
  : openInverseChain program inverseChain? {
    var inverse = yy.prepareBlock($1, $2, $3, $3, false, @$),
        program = yy.prepareProgram([inverse], $2.loc);
    program.chained = true;

    $$ = { strip: $1.strip, program: program, chain: true };
  }
  | inverseAndProgram -> $1
  ;

closeBlock
  : OPEN_ENDBLOCK helperName CLOSE -> {path: $2, strip: yy.stripFlags($1, $3)}
  ;

mustache
  // Parsing out the '&' escape token at AST level saves ~500 bytes after min due to the removal of one parser node.
  // This also allows for handler unification as all mustache node instances can utilize the same handler
  : OPEN helperName param* hash? CLOSE -> yy.prepareMustache($2, $3, $4, $1, yy.stripFlags($1, $5), @$)
  | OPEN_UNESCAPED helperName param* hash? CLOSE_UNESCAPED -> yy.prepareMustache($2, $3, $4, $1, yy.stripFlags($1, $5), @$)
  ;

partial
  : OPEN_PARTIAL partialName param* hash? CLOSE {
    $$ = {
      type: 'PartialStatement',
      name: $2,
      params: $3,
      hash: $4,
      indent: '',
      strip: yy.stripFlags($1, $5),
      loc: yy.locInfo(@$)
    };
  }
  ;
partialBlock
  : openPartialBlock program closeBlock -> yy.preparePartialBlock($1, $2, $3, @$)
  ;
openPartialBlock
  : OPEN_PARTIAL_BLOCK partialName param* hash? CLOSE -> { path: $2, params: $3, hash: $4, strip: yy.stripFlags($1, $5) }
  ;

param
  : helperName -> $1
  | sexpr -> $1
  ;

sexpr
  : OPEN_SEXPR helperName param* hash? CLOSE_SEXPR {
    $$ = {
      type: 'SubExpression',
      path: $2,
      params: $3,
      hash: $4,
      loc: yy.locInfo(@$)
    };
  };

hash
  : hashSegment+ -> {type: 'Hash', pairs: $1, loc: yy.locInfo(@$)}
  ;

hashSegment
  : ID EQUALS param -> {type: 'HashPair', key: yy.id($1), value: $3, loc: yy.locInfo(@$)}
  ;

blockParams
  : OPEN_BLOCK_PARAMS ID+ CLOSE_BLOCK_PARAMS -> yy.id($2)
  ;

helperName
  : path -> $1
  | dataName -> $1
  | STRING -> {type: 'StringLiteral', value: $1, original: $1, loc: yy.locInfo(@$)}
  | NUMBER -> {type: 'NumberLiteral', value: Number($1), original: Number($1), loc: yy.locInfo(@$)}
  | BOOLEAN -> {type: 'BooleanLiteral', value: $1 === 'true', original: $1 === 'true', loc: yy.locInfo(@$)}
  | UNDEFINED -> {type: 'UndefinedLiteral', original: undefined, value: undefined, loc: yy.locInfo(@$)}
  | NULL -> {type: 'NullLiteral', original: null, value: null, loc: yy.locInfo(@$)}
  ;

partialName
  : helperName -> $1
  | sexpr -> $1
  ;

dataName
  : DATA pathSegments -> yy.preparePath(true, $2, @$)
  ;

path
  : pathSegments -> yy.preparePath(false, $1, @$)
  ;

pathSegments
  : pathSegments SEP ID { $1.push({part: yy.id($3), original: $3, separator: $2}); $$ = $1; }
  | ID -> [{part: yy.id($1), original: $1}]
  ;
