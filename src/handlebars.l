
%x mu emu

%%

[^\x00]*?/("{{")                 {
                                   if(yytext.slice(-1) !== "\\") this.begin("mu");
                                   if(yytext.slice(-1) === "\\") yytext = yytext.substr(0,yyleng-1), this.begin("emu");
                                   if(yytext) return 'CONTENT';
                                 }

[^\x00]+                         { return 'CONTENT'; }

<emu>[^\x00]{2,}?/("{{")         { this.popState(); return 'CONTENT'; }

<mu>"{{>"                        { return 'OPEN_PARTIAL'; }
<mu>"{{#"                        { return 'OPEN_BLOCK'; }
<mu>"{{/"                        { return 'OPEN_ENDBLOCK'; }
<mu>"{{^"                        { return 'OPEN_INVERSE'; }
<mu>"{{"\s*"else"                { return 'OPEN_INVERSE'; }
<mu>"{{{"                        { return 'OPEN_UNESCAPED'; }
<mu>"{{&"                        { return 'OPEN_UNESCAPED'; }
<mu>"{{!"[\s\S]*?"}}"            { yytext = yytext.substr(3,yyleng-5); this.popState(); return 'COMMENT'; }
<mu>"{{"                         { return 'OPEN'; }

<mu>"="                          { return 'EQUALS'; }
<mu>"."/[} ]                     { return 'ID'; }
<mu>".."                         { return 'ID'; }
<mu>[\/.]                        { return 'SEP'; }
<mu>\s+                          { /*ignore whitespace*/ }
<mu>"}}}"                        { this.popState(); return 'CLOSE'; }
<mu>"}}"                         { this.popState(); return 'CLOSE'; }
<mu>'"'("\\"["]|[^"])*'"'        { yytext = yytext.substr(1,yyleng-2).replace(/\\"/g,'"'); return 'STRING'; }
<mu>"true"/[}\s]                 { return 'BOOLEAN'; }
<mu>"false"/[}\s]                { return 'BOOLEAN'; }
<mu>[0-9]+/[}\s]                 { return 'INTEGER'; }
<mu>[a-zA-Z0-9_$-]+/[=}\s\/.]    { return 'ID'; }
<mu>'['[^\]]*']'                 { yytext = yytext.substr(1, yyleng-2); return 'ID'; }
<mu>.                            { return 'INVALID'; }

<INITIAL,mu><<EOF>>              { return 'EOF'; }

