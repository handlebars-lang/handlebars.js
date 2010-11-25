%start root

%%

root
  : program { return $1 }
  ;

program
  : statements simpleInverse statements { $$ = new yy.ProgramNode($1, $3) }
  | statements { $$ = new yy.ProgramNode($1) }
  ;

statements
  : statement { $$ = [$1] }
  | statements statement { $1.push($2); $$ = $1 }
  ;

statement
  : openBlock program closeBlock { $$ = new yy.BlockNode($1, $2) }
  | mustache { $$ = $1 }
  | partial { $$ = $1 }
  | CONTENT { $$ = new yy.ContentNode($1) }
  | COMMENT { $$ = new yy.CommentNode($1) }
  ;

openBlock
  : OPEN_BLOCK inMustache CLOSE { $$ = new yy.MustacheNode($2) }
  ;

closeBlock
  : OPEN_ENDBLOCK id CLOSE { }
  ;

mustache
  : OPEN inMustache CLOSE { $$ = new yy.MustacheNode($2) }
  ;

partial
  : OPEN_PARTIAL id CLOSE { $$ = new yy.PartialNode($2) }
  ;

simpleInverse
  : OPEN_INVERSE CLOSE { }
  ;

inMustache
  : id params { $$ = [$1].concat($2) }
  | id { $$ = [$1] }
  ;

params
  : params param { $1.push($2); $$ = $1; }
  | param { $$ = [$1] }
  ;

param
  : id { $$ = $1 }
  | STRING { $$ = new yy.StringNode($1) }
  ;

id
  : ID { $$ = new yy.IdNode($1) }
  ;

