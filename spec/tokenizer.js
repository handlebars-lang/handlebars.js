function shouldMatchTokens(result, tokens) {
  for (var index = 0; index < result.length; index++) {
    equals(result[index].name, tokens[index]);
  }
}
function shouldBeToken(result, name, text) {
  equals(result.name, name);
  equals(result.text, text);
}

describe('Tokenizer', function() {
  if (!Handlebars.Parser) {
    return;
  }

  function tokenize(template) {
    var parser = Handlebars.Parser,
        lexer = parser.lexer;

    lexer.setInput(template);
    var out = [],
        token;

    while (token = lexer.lex()) {
      var result = parser.terminals_[token] || token;
      if (!result || result === 'EOF' || result === 'INVALID') {
        break;
      }
      out.push({name: result, text: lexer.yytext});
    }

    return out;
  }

  it('tokenizes a simple mustache as "OPEN ID CLOSE"', function() {
    var result = tokenize("{{foo}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "ID", "foo");
  });

  it('supports unescaping with &', function() {
    var result = tokenize("{{&bar}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE']);

    shouldBeToken(result[0], "OPEN", "{{&");
    shouldBeToken(result[1], "ID", "bar");
  });

  it('supports unescaping with {{{', function() {
    var result = tokenize("{{{bar}}}");
    shouldMatchTokens(result, ['OPEN_UNESCAPED', 'ID', 'CLOSE_UNESCAPED']);

    shouldBeToken(result[1], "ID", "bar");
  });

  it('supports escaping delimiters', function() {
    var result = tokenize("{{foo}} \\{{bar}} {{baz}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE', 'CONTENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);

    shouldBeToken(result[3], "CONTENT", " ");
    shouldBeToken(result[4], "CONTENT", "{{bar}} ");
  });

  it('supports escaping multiple delimiters', function() {
    var result = tokenize("{{foo}} \\{{bar}} \\{{baz}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE', 'CONTENT', 'CONTENT', 'CONTENT']);

    shouldBeToken(result[3], "CONTENT", " ");
    shouldBeToken(result[4], "CONTENT", "{{bar}} ");
    shouldBeToken(result[5], "CONTENT", "{{baz}}");
  });

  it('supports escaping a triple stash', function() {
    var result = tokenize("{{foo}} \\{{{bar}}} {{baz}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE', 'CONTENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);

    shouldBeToken(result[4], "CONTENT", "{{{bar}}} ");
  });

  it('supports escaping escape character', function() {
    var result = tokenize("{{foo}} \\\\{{bar}} {{baz}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE', 'CONTENT', 'OPEN', 'ID', 'CLOSE', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);

    shouldBeToken(result[3], "CONTENT", " \\");
    shouldBeToken(result[5], "ID", "bar");
  });

  it('supports escaping multiple escape characters', function() {
    var result = tokenize("{{foo}} \\\\{{bar}} \\\\{{baz}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE', 'CONTENT', 'OPEN', 'ID', 'CLOSE', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);

    shouldBeToken(result[3], "CONTENT", " \\");
    shouldBeToken(result[5], "ID", "bar");
    shouldBeToken(result[7], "CONTENT", " \\");
    shouldBeToken(result[9], "ID", "baz");
  });

  it('supports escaped mustaches after escaped escape characters', function() {
    var result = tokenize("{{foo}} \\\\{{bar}} \\{{baz}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE', 'CONTENT', 'OPEN', 'ID', 'CLOSE', 'CONTENT', 'CONTENT', 'CONTENT']);

    shouldBeToken(result[3], "CONTENT", " \\");
    shouldBeToken(result[4], "OPEN", "{{");
    shouldBeToken(result[5], "ID", "bar");
    shouldBeToken(result[7], "CONTENT", " ");
    shouldBeToken(result[8], "CONTENT", "{{baz}}");
  });

  it('supports escaped escape characters after escaped mustaches', function() {
    var result = tokenize("{{foo}} \\{{bar}} \\\\{{baz}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE', 'CONTENT', 'CONTENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);

    shouldBeToken(result[4], "CONTENT", "{{bar}} ");
    shouldBeToken(result[5], "CONTENT", "\\");
    shouldBeToken(result[6], "OPEN", "{{");
    shouldBeToken(result[7], "ID", "baz");
  });

  it('supports escaped escape character on a triple stash', function() {
    var result = tokenize("{{foo}} \\\\{{{bar}}} {{baz}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE', 'CONTENT', 'OPEN_UNESCAPED', 'ID', 'CLOSE_UNESCAPED', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);

    shouldBeToken(result[3], "CONTENT", " \\");
    shouldBeToken(result[5], "ID", "bar");
  });

  it('tokenizes a simple path', function() {
    var result = tokenize("{{foo/bar}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('allows dot notation', function() {
    var result = tokenize("{{foo.bar}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);

    shouldMatchTokens(tokenize("{{foo.bar.baz}}"), ['OPEN', 'ID', 'SEP', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('allows path literals with []', function() {
    var result = tokenize("{{foo.[bar]}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('allows multiple path literals on a line with []', function() {
    var result = tokenize("{{foo.[bar]}}{{foo.[baz]}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'SEP', 'ID', 'CLOSE', 'OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('tokenizes {{.}} as OPEN ID CLOSE', function() {
    var result = tokenize("{{.}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE']);
  });

  it('tokenizes a path as "OPEN (ID SEP)* ID CLOSE"', function() {
    var result = tokenize("{{../foo/bar}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'SEP', 'ID', 'SEP', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "ID", "..");
  });

  it('tokenizes a path with .. as a parent path', function() {
    var result = tokenize("{{../foo.bar}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'SEP', 'ID', 'SEP', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "ID", "..");
  });

  it('tokenizes a path with this/foo as OPEN ID SEP ID CLOSE', function() {
    var result = tokenize("{{this/foo}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "ID", "this");
    shouldBeToken(result[3], "ID", "foo");
  });

  it('tokenizes a simple mustache with spaces as "OPEN ID CLOSE"', function() {
    var result = tokenize("{{  foo  }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "ID", "foo");
  });

  it('tokenizes a simple mustache with line breaks as "OPEN ID ID CLOSE"', function() {
    var result = tokenize("{{  foo  \n   bar }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "ID", "foo");
  });

  it('tokenizes raw content as "CONTENT"', function() {
    var result = tokenize("foo {{ bar }} baz");
    shouldMatchTokens(result, ['CONTENT', 'OPEN', 'ID', 'CLOSE', 'CONTENT']);
    shouldBeToken(result[0], "CONTENT", "foo ");
    shouldBeToken(result[4], "CONTENT", " baz");
  });

  it('tokenizes a partial as "OPEN_PARTIAL ID CLOSE"', function() {
    var result = tokenize("{{> foo}}");
    shouldMatchTokens(result, ['OPEN_PARTIAL', 'ID', 'CLOSE']);
  });

  it('tokenizes a partial with context as "OPEN_PARTIAL ID ID CLOSE"', function() {
    var result = tokenize("{{> foo bar }}");
    shouldMatchTokens(result, ['OPEN_PARTIAL', 'ID', 'ID', 'CLOSE']);
  });

  it('tokenizes a partial without spaces as "OPEN_PARTIAL ID CLOSE"', function() {
    var result = tokenize("{{>foo}}");
    shouldMatchTokens(result, ['OPEN_PARTIAL', 'ID', 'CLOSE']);
  });

  it('tokenizes a partial space at the }); as "OPEN_PARTIAL ID CLOSE"', function() {
    var result = tokenize("{{>foo  }}");
    shouldMatchTokens(result, ['OPEN_PARTIAL', 'ID', 'CLOSE']);
  });

  it('tokenizes a partial space at the }); as "OPEN_PARTIAL ID CLOSE"', function() {
    var result = tokenize("{{>foo/bar.baz  }}");
    shouldMatchTokens(result, ['OPEN_PARTIAL', 'ID', 'SEP', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('tokenizes a comment as "COMMENT"', function() {
    var result = tokenize("foo {{! this is a comment }} bar {{ baz }}");
    shouldMatchTokens(result, ['CONTENT', 'COMMENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "COMMENT", " this is a comment ");
  });

  it('tokenizes a block comment as "COMMENT"', function() {
    var result = tokenize("foo {{!-- this is a {{comment}} --}} bar {{ baz }}");
    shouldMatchTokens(result, ['CONTENT', 'COMMENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "COMMENT", " this is a {{comment}} ");
  });

  it('tokenizes a block comment with whitespace as "COMMENT"', function() {
    var result = tokenize("foo {{!-- this is a\n{{comment}}\n--}} bar {{ baz }}");
    shouldMatchTokens(result, ['CONTENT', 'COMMENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "COMMENT", " this is a\n{{comment}}\n");
  });

  it('tokenizes open and closing blocks as OPEN_BLOCK, ID, CLOSE ..., OPEN_ENDBLOCK ID CLOSE', function() {
    var result = tokenize("{{#foo}}content{{/foo}}");
    shouldMatchTokens(result, ['OPEN_BLOCK', 'ID', 'CLOSE', 'CONTENT', 'OPEN_ENDBLOCK', 'ID', 'CLOSE']);
  });

  it('tokenizes inverse sections as "OPEN_INVERSE CLOSE"', function() {
    shouldMatchTokens(tokenize("{{^}}"), ['OPEN_INVERSE', 'CLOSE']);
    shouldMatchTokens(tokenize("{{else}}"), ['OPEN_INVERSE', 'CLOSE']);
    shouldMatchTokens(tokenize("{{ else }}"), ['OPEN_INVERSE', 'CLOSE']);
  });

  it('tokenizes inverse sections with ID as "OPEN_INVERSE ID CLOSE"', function() {
    var result = tokenize("{{^foo}}");
    shouldMatchTokens(result, ['OPEN_INVERSE', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "ID", "foo");
  });

  it('tokenizes inverse sections with ID and spaces as "OPEN_INVERSE ID CLOSE"', function() {
    var result = tokenize("{{^ foo  }}");
    shouldMatchTokens(result, ['OPEN_INVERSE', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "ID", "foo");
  });

  it('tokenizes mustaches with params as "OPEN ID ID ID CLOSE"', function() {
    var result = tokenize("{{ foo bar baz }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'ID', 'CLOSE']);
    shouldBeToken(result[1], "ID", "foo");
    shouldBeToken(result[2], "ID", "bar");
    shouldBeToken(result[3], "ID", "baz");
  });

  it('tokenizes mustaches with String params as "OPEN ID ID STRING CLOSE"', function() {
    var result = tokenize("{{ foo bar \"baz\" }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'STRING', 'CLOSE']);
    shouldBeToken(result[3], "STRING", "baz");
  });

  it('tokenizes mustaches with String params using single quotes as "OPEN ID ID STRING CLOSE"', function() {
    var result = tokenize("{{ foo bar \'baz\' }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'STRING', 'CLOSE']);
    shouldBeToken(result[3], "STRING", "baz");
  });

  it('tokenizes String params with spaces inside as "STRING"', function() {
    var result = tokenize("{{ foo bar \"baz bat\" }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'STRING', 'CLOSE']);
    shouldBeToken(result[3], "STRING", "baz bat");
  });

  it('tokenizes String params with escapes quotes as STRING', function() {
    var result = tokenize('{{ foo "bar\\"baz" }}');
    shouldMatchTokens(result, ['OPEN', 'ID', 'STRING', 'CLOSE']);
    shouldBeToken(result[2], "STRING", 'bar"baz');
  });

  it('tokenizes String params using single quotes with escapes quotes as STRING', function() {
    var result = tokenize("{{ foo 'bar\\'baz' }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'STRING', 'CLOSE']);
    shouldBeToken(result[2], "STRING", "bar'baz");
  });

  it('tokenizes numbers', function() {
    var result = tokenize('{{ foo 1 }}');
    shouldMatchTokens(result, ['OPEN', 'ID', 'INTEGER', 'CLOSE']);
    shouldBeToken(result[2], "INTEGER", "1");

    result = tokenize('{{ foo -1 }}');
    shouldMatchTokens(result, ['OPEN', 'ID', 'INTEGER', 'CLOSE']);
    shouldBeToken(result[2], "INTEGER", "-1");
  });

  it('tokenizes booleans', function() {
    var result = tokenize('{{ foo true }}');
    shouldMatchTokens(result, ['OPEN', 'ID', 'BOOLEAN', 'CLOSE']);
    shouldBeToken(result[2], "BOOLEAN", "true");

    result = tokenize('{{ foo false }}');
    shouldMatchTokens(result, ['OPEN', 'ID', 'BOOLEAN', 'CLOSE']);
    shouldBeToken(result[2], "BOOLEAN", "false");
  });

  it('tokenizes hash arguments', function() {
    var result = tokenize("{{ foo bar=baz }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'EQUALS', 'ID', 'CLOSE']);

    result = tokenize("{{ foo bar baz=bat }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'ID', 'CLOSE']);

    result = tokenize("{{ foo bar baz=1 }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'INTEGER', 'CLOSE']);

    result = tokenize("{{ foo bar baz=true }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'BOOLEAN', 'CLOSE']);

    result = tokenize("{{ foo bar baz=false }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'BOOLEAN', 'CLOSE']);

    result = tokenize("{{ foo bar\n  baz=bat }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'ID', 'CLOSE']);

    result = tokenize("{{ foo bar baz=\"bat\" }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'STRING', 'CLOSE']);

    result = tokenize("{{ foo bar baz=\"bat\" bam=wot }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'STRING', 'ID', 'EQUALS', 'ID', 'CLOSE']);

    result = tokenize("{{foo omg bar=baz bat=\"bam\"}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'ID', 'ID', 'EQUALS', 'STRING', 'CLOSE']);
    shouldBeToken(result[2], "ID", "omg");
  });

  it('tokenizes special @ identifiers', function() {
    var result = tokenize("{{ @foo }}");
    shouldMatchTokens(result, ['OPEN', 'DATA', 'ID', 'CLOSE']);
    shouldBeToken(result[2], "ID", "foo");

    result = tokenize("{{ foo @bar }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'DATA', 'ID', 'CLOSE']);
    shouldBeToken(result[3], "ID", "bar");

    result = tokenize("{{ foo bar=@baz }}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'ID', 'EQUALS', 'DATA', 'ID', 'CLOSE']);
    shouldBeToken(result[5], "ID", "baz");
  });

  it('does not time out in a mustache with a single } followed by EOF', function() {
    shouldMatchTokens(tokenize("{{foo}"), ['OPEN', 'ID']);
  });

  it('does not time out in a mustache when invalid ID characters are used', function() {
    shouldMatchTokens(tokenize("{{foo & }}"), ['OPEN', 'ID']);
  });

  it('tokenizes subexpressions', function() {
    var result = tokenize("{{foo (bar)}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'OPEN_SEXPR', 'ID', 'CLOSE_SEXPR', 'CLOSE']);
    shouldBeToken(result[1], "ID", "foo");
    shouldBeToken(result[3], "ID", "bar");

    result = tokenize("{{foo (a-x b-y)}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'OPEN_SEXPR', 'ID', 'ID', 'CLOSE_SEXPR', 'CLOSE']);
    shouldBeToken(result[1], "ID", "foo");
    shouldBeToken(result[3], "ID", "a-x");
    shouldBeToken(result[4], "ID", "b-y");
  });

  it('tokenizes nested subexpressions', function() {
    var result = tokenize("{{foo (bar (lol rofl)) (baz)}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'OPEN_SEXPR', 'ID', 'OPEN_SEXPR', 'ID', 'ID', 'CLOSE_SEXPR', 'CLOSE_SEXPR', 'OPEN_SEXPR', 'ID', 'CLOSE_SEXPR', 'CLOSE']);
    shouldBeToken(result[3],  "ID", "bar");
    shouldBeToken(result[5],  "ID", "lol");
    shouldBeToken(result[6],  "ID", "rofl");
    shouldBeToken(result[10], "ID", "baz");
  });

  it('tokenizes nested subexpressions: literals', function() {
    var result = tokenize("{{foo (bar (lol true) false) (baz 1) (blah 'b') (blorg \"c\")}}");
    shouldMatchTokens(result, ['OPEN', 'ID', 'OPEN_SEXPR', 'ID', 'OPEN_SEXPR', 'ID', 'BOOLEAN', 'CLOSE_SEXPR', 'BOOLEAN', 'CLOSE_SEXPR', 'OPEN_SEXPR', 'ID', 'INTEGER', 'CLOSE_SEXPR', 'OPEN_SEXPR', 'ID', 'STRING', 'CLOSE_SEXPR', 'OPEN_SEXPR', 'ID', 'STRING', 'CLOSE_SEXPR', 'CLOSE']);
  });
});
