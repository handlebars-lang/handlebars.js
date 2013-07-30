
%x mu emu com

%{

function strip(start, end) {
  return yytext = yytext.substr(start, yyleng-end);
}

%}


LOOKAHEAD           [=}\s\/.]
LITERAL_LOOKAHEAD   [}\s]

/*
ID is the inverse of control characters.
Control characters ranges:
  [\s]          Whitespace
  [!"#%-,\./]   !, ", #, %, &, ', (, ), *, +, ,, ., /,  Exceptions in range: $, -
  [;->@]        ;, <, =, >, @,                          Exceptions in range: :, ?
  [\[-\^`]      [, \, ], ^, `,                          Exceptions in range: _
  [\{-~]        {, |, }, ~
*/
ID    [^\s!"#%-,\.\/;->@\[-\^`\{-~]+/{LOOKAHEAD}

%%

[^\x00]*?/("{{")                 {
                                   if(yytext.slice(-2) === "\\\\") {
                                     strip(0,1);
                                     this.begin("mu");
                                   } else if(yytext.slice(-1) === "\\") {
                                     strip(0,1);
                                     this.begin("emu");
                                   } else {
                                     this.begin("mu");
                                   }
                                   if(yytext) return 'CONTENT';
                                 }

[^\x00]+                         return 'CONTENT';

<emu>[^\x00]{2,}?/("{{"|<<EOF>>) {
                                   if(yytext.slice(-1) !== "\\") this.popState();
                                   if(yytext.slice(-1) === "\\") strip(0,1);
                                   return 'CONTENT';
                                 }

<com>[\s\S]*?"--}}"              strip(0,4); this.popState(); return 'COMMENT';

<mu>"{{>"                        return 'OPEN_PARTIAL';
<mu>"{{#"                        return 'OPEN_BLOCK';
<mu>"{{/"                        return 'OPEN_ENDBLOCK';
<mu>"{{^"                        return 'OPEN_INVERSE';
<mu>"{{"\s*"else"                return 'OPEN_INVERSE';
<mu>"{{{"                        return 'OPEN_UNESCAPED';
<mu>"{{&"                        return 'OPEN';
<mu>"{{!--"                      this.popState(); this.begin('com');
<mu>"{{!"[\s\S]*?"}}"            strip(3,5); this.popState(); return 'COMMENT';
<mu>"{{"                         return 'OPEN';

<mu>"="                          return 'EQUALS';
<mu>".."                         return 'ID';
<mu>"."/{LOOKAHEAD}              return 'ID';
<mu>[\/.]                        return 'SEP';
<mu>\s+                          /*ignore whitespace*/
<mu>"}}}"                        this.popState(); return 'CLOSE_UNESCAPED';
<mu>"}}"                         this.popState(); return 'CLOSE';
<mu>'"'("\\"["]|[^"])*'"'        yytext = strip(1,2).replace(/\\"/g,'"'); return 'STRING';
<mu>"'"("\\"[']|[^'])*"'"        yytext = strip(1,2).replace(/\\'/g,"'"); return 'STRING';
<mu>"@"                          return 'DATA';
<mu>"true"/{LITERAL_LOOKAHEAD}   return 'BOOLEAN';
<mu>"false"/{LITERAL_LOOKAHEAD}  return 'BOOLEAN';
<mu>\-?[0-9]+/{LITERAL_LOOKAHEAD} return 'INTEGER';

<mu>{ID}                         return 'ID';

<mu>'['[^\]]*']'                 yytext = strip(1,2); return 'ID';
<mu>.                            return 'INVALID';

<INITIAL,mu><<EOF>>              return 'EOF';
