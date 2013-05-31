%start root

%%

root
  : program EOF { return $1; }
  ;

program
  : simpleInverse statements { $$ = new yy.ProgramNode([], $2); }
  | statements simpleInverse statements { $$ = new yy.ProgramNode($1, $3); }
  | statements simpleInverse { $$ = new yy.ProgramNode($1, []); }
  | statements { $$ = new yy.ProgramNode($1); }
  | simpleInverse { $$ = new yy.ProgramNode([], []); }
  | "" { $$ = new yy.ProgramNode([]); }
  ;

statements
  : statement { $$ = [$1]; }
  | statements statement { $1.push($2); $$ = $1; }
  ;

statement
  : openInverse program closeBlock { $$ = new yy.BlockNode($1, $2.inverse, $2, $3); }
  | openBlock program closeBlock { $$ = new yy.BlockNode($1, $2, $2.inverse, $3); }
  | mustache { $$ = $1; }
  | partial { $$ = $1; }
  | CONTENT { $$ = new yy.ContentNode($1); }
  | COMMENT { $$ = new yy.CommentNode($1); }
  ;

openBlock
  : OPEN_BLOCK inMustache CLOSE { $$ = new yy.MustacheNode($2[0], $2[1]); }
  ;

openInverse
  : OPEN_INVERSE inMustache CLOSE { $$ = new yy.MustacheNode($2[0], $2[1]); }
  ;

closeBlock
  : OPEN_ENDBLOCK path CLOSE { $$ = $2; }
  ;

mustache
  : OPEN inMustache CLOSE {
    // Parsing out the '&' escape token at this level saves ~500 bytes after min due to the removal of one parser node.
    $$ = new yy.MustacheNode($2[0], $2[1], $1[2] === '&');
  }
  | OPEN_UNESCAPED inMustache CLOSE_UNESCAPED { $$ = new yy.MustacheNode($2[0], $2[1], true); }
  ;


partial
  : OPEN_PARTIAL partialName CLOSE { $$ = new yy.PartialNode($2); }
  | OPEN_PARTIAL partialName path CLOSE { $$ = new yy.PartialNode($2, $3); }
  ;

simpleInverse
  : OPEN_INVERSE CLOSE { }
  ;

inMustache
  : path params hash { $$ = [[$1].concat($2), $3]; }
  | path params { $$ = [[$1].concat($2), null]; }
  | path hash { $$ = [[$1], $2]; }
  | path { $$ = [[$1], null]; }
  | dataName { $$ = [[$1], null]; }
  ;

params
  : params param { $1.push($2); $$ = $1; }
  | param { $$ = [$1]; }
  ;

param
  : path { $$ = $1; }
  | STRING { $$ = new yy.StringNode($1); }
  | INTEGER { $$ = new yy.IntegerNode($1); }
  | BOOLEAN { $$ = new yy.BooleanNode($1); }
  | dataName { $$ = $1; }
  ;

hash
  : hashSegments { $$ = new yy.HashNode($1); }
  ;

hashSegments
  : hashSegments hashSegment { $1.push($2); $$ = $1; }
  | hashSegment { $$ = [$1]; }
  ;

hashSegment
  : ID EQUALS path { $$ = [$1, $3]; }
  | ID EQUALS STRING { $$ = [$1, new yy.StringNode($3)]; }
  | ID EQUALS INTEGER { $$ = [$1, new yy.IntegerNode($3)]; }
  | ID EQUALS BOOLEAN { $$ = [$1, new yy.BooleanNode($3)]; }
  | ID EQUALS dataName { $$ = [$1, $3]; }
  ;

partialName
  : path { $$ = new yy.PartialNameNode($1); }
  | STRING { $$ = new yy.PartialNameNode(new yy.StringNode($1)); }
  | INTEGER { $$ = new yy.PartialNameNode(new yy.IntegerNode($1)); }
  ;

dataName
  : DATA path { $$ = new yy.DataNode($2); }
  ;

path
  : pathSegments { $$ = new yy.IdNode($1); }
  ;

pathSegments
  : pathSegments SEP ID { $1.push({part: $3, separator: $2}); $$ = $1; }
  | ID { $$ = [{part: $1}]; }
  ;

