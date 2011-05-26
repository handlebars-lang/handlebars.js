
%x mu

%%

[^\x00]*?/("{{")                 { this.begin("mu"); if (yytext) return 'CONTENT'; }
[^\x00]+                         { return 'CONTENT'; }

<mu>"{{#>>"                  { return 'OPEN_INLINE_PARTIAL'; }
<mu>"{{>"                    { return 'OPEN_PARTIAL'; }
<mu>"{{#"                    { return 'OPEN_BLOCK'; }
<mu>"{{/>>"                  { return 'OPEN_ENDINLINE_PARTIAL'; }
<mu>"{{/"                    { return 'OPEN_ENDBLOCK'; }
<mu>"{{^"                    { return 'OPEN_INVERSE'; }
<mu>"{{"\s*"else"            { return 'OPEN_INVERSE'; }
<mu>"{{{"                    { return 'OPEN_UNESCAPED'; }
<mu>"{{&"                    { return 'OPEN_UNESCAPED'; }
<mu>"{{!"[\s\S]*?"}}"        { yytext = yytext.substr(3,yyleng-5); this.begin("INITIAL"); return 'COMMENT'; }
<mu>"{{"                     { return 'OPEN'; }

<mu>"="                      { return 'EQUALS'; }
<mu>"."/[} ]                 { return 'ID'; }
<mu>".."                     { return 'ID'; }
<mu>[/.]                     { return 'SEP'; }
<mu>\s+                      { /*ignore whitespace*/ }
<mu>"}}}"                    { this.begin("INITIAL"); return 'CLOSE'; }
<mu>"}}"                     { this.begin("INITIAL"); return 'CLOSE'; }
<mu>'"'("\\"["]|[^"])*'"'    { yytext = yytext.substr(1,yyleng-2).replace(/\\"/g,'"'); return 'STRING'; }
<mu>[a-zA-Z0-9_$-]+/[=}\s/.] { return 'ID'; }
<mu>.                        { return 'INVALID'; }

<INITIAL,mu><<EOF>>          { return 'EOF'; }

