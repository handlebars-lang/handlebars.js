
%x mu emu com

%{

function strip(start, end) {
  return yytext = yytext.substr(start, yyleng-end);
}

%}

LEFT_STRIP    "~"
RIGHT_STRIP   "~"

LOOKAHEAD           [=~}\s\/.)]
LITERAL_LOOKAHEAD   [~}\s)]

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

// marks CONTENT up to the next mustache or escaped mustache
<emu>[^\x00]{2,}?/("{{"|"\\{{"|"\\\\{{"|<<EOF>>) {
                                   this.popState();
                                   return 'CONTENT';
                                 }

<com>[\s\S]*?"--}}"              strip(0,4); this.popState(); return 'COMMENT';

<mu>"("                          return 'OPEN_SEXPR';
<mu>")"                          return 'CLOSE_SEXPR';

<mu>"{{"{LEFT_STRIP}?">"         return 'OPEN_PARTIAL';
<mu>"{{"{LEFT_STRIP}?"#"         return 'OPEN_BLOCK';
<mu>"{{"{LEFT_STRIP}?"/"         return 'OPEN_ENDBLOCK';
<mu>"{{"{LEFT_STRIP}?"^"         return 'OPEN_INVERSE';
<mu>"{{"{LEFT_STRIP}?\s*"else"   return 'OPEN_INVERSE';
<mu>"{{"{LEFT_STRIP}?"{"         return 'OPEN_UNESCAPED';
<mu>"{{"{LEFT_STRIP}?"&"         return 'OPEN';
<mu>"{{!--"                      this.popState(); this.begin('com');
<mu>"{{!"[\s\S]*?"}}"            strip(3,5); this.popState(); return 'COMMENT';
<mu>"{{"{LEFT_STRIP}?            return 'OPEN';

<mu>"="                          return 'EQUALS';
<mu>".."                         return 'ID';
<mu>"."/{LOOKAHEAD}              return 'ID';
<mu>[\/.]                        return 'SEP';
<mu>\s+                          // ignore whitespace
<mu>"}"{RIGHT_STRIP}?"}}"        this.popState(); return 'CLOSE_UNESCAPED';
<mu>{RIGHT_STRIP}?"}}"           this.popState(); return 'CLOSE';
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
