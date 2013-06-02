var should = require('should');

should.Assertion.prototype.match_tokens = function(tokens) {
  this.obj.forEach(function(value, index) {
    value.name.should.equal(tokens[index]);
  });
};
should.Assertion.prototype.be_token = function(name, text) {
  this.obj.should.eql({name: name, text: text});
};

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
    result.should.match_tokens(['OPEN', 'ID', 'CLOSE']);
    result[1].should.be_token("ID", "foo");
  });

  it('supports unescaping with &', function() {
    var result = tokenize("{{&bar}}");
    result.should.match_tokens(['OPEN', 'ID', 'CLOSE']);

    result[0].should.be_token("OPEN", "{{&");
    result[1].should.be_token("ID", "bar");
  });

  it('supports unescaping with {{{', function() {
    var result = tokenize("{{{bar}}}");
    result.should.match_tokens(['OPEN_UNESCAPED', 'ID', 'CLOSE_UNESCAPED']);

    result[1].should.be_token("ID", "bar");
  });

  it('supports escaping delimiters', function() {
    var result = tokenize("{{foo}} \\{{bar}} {{baz}}");
    result.should.match_tokens(['OPEN', 'ID', 'CLOSE', 'CONTENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);

    result[4].should.be_token("CONTENT", "{{bar}} ");
  });

  it('supports escaping multiple delimiters', function() {
    var result = tokenize("{{foo}} \\{{bar}} \\{{baz}}");
    result.should.match_tokens(['OPEN', 'ID', 'CLOSE', 'CONTENT', 'CONTENT', 'CONTENT']);

    result[3].should.be_token("CONTENT", " ");
    result[4].should.be_token("CONTENT", "{{bar}} ");
    result[5].should.be_token("CONTENT", "{{baz}}");
  });

  it('supports escaping a triple stash', function() {
    var result = tokenize("{{foo}} \\{{{bar}}} {{baz}}");
    result.should.match_tokens(['OPEN', 'ID', 'CLOSE', 'CONTENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);

    result[4].should.be_token("CONTENT", "{{{bar}}} ");
  });

  it('tokenizes a simple path', function() {
    var result = tokenize("{{foo/bar}}");
    result.should.match_tokens(['OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('allows dot notation', function() {
    var result = tokenize("{{foo.bar}}");
    result.should.match_tokens(['OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);

    tokenize("{{foo.bar.baz}}").should.match_tokens(['OPEN', 'ID', 'SEP', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('allows path literals with []', function() {
    var result = tokenize("{{foo.[bar]}}");
    result.should.match_tokens(['OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('allows multiple path literals on a line with []', function() {
    var result = tokenize("{{foo.[bar]}}{{foo.[baz]}}");
    result.should.match_tokens(['OPEN', 'ID', 'SEP', 'ID', 'CLOSE', 'OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('tokenizes {{.}} as OPEN ID CLOSE', function() {
    var result = tokenize("{{.}}");
    result.should.match_tokens(['OPEN', 'ID', 'CLOSE']);
  });

  it('tokenizes a path as "OPEN (ID SEP)* ID CLOSE"', function() {
    var result = tokenize("{{../foo/bar}}");
    result.should.match_tokens(['OPEN', 'ID', 'SEP', 'ID', 'SEP', 'ID', 'CLOSE']);
    result[1].should.be_token("ID", "..");
  });

  it('tokenizes a path with .. as a parent path', function() {
    var result = tokenize("{{../foo.bar}}");
    result.should.match_tokens(['OPEN', 'ID', 'SEP', 'ID', 'SEP', 'ID', 'CLOSE']);
    result[1].should.be_token("ID", "..");
  });

  it('tokenizes a path with this/foo as OPEN ID SEP ID CLOSE', function() {
    var result = tokenize("{{this/foo}}");
    result.should.match_tokens(['OPEN', 'ID', 'SEP', 'ID', 'CLOSE']);
    result[1].should.be_token("ID", "this");
    result[3].should.be_token("ID", "foo");
  });

  it('tokenizes a simple mustache with spaces as "OPEN ID CLOSE"', function() {
    var result = tokenize("{{  foo  }}");
    result.should.match_tokens(['OPEN', 'ID', 'CLOSE']);
    result[1].should.be_token("ID", "foo");
  });

  it('tokenizes a simple mustache with line breaks as "OPEN ID ID CLOSE"', function() {
    var result = tokenize("{{  foo  \n   bar }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'CLOSE']);
    result[1].should.be_token("ID", "foo");
  });

  it('tokenizes raw content as "CONTENT"', function() {
    var result = tokenize("foo {{ bar }} baz");
    result.should.match_tokens(['CONTENT', 'OPEN', 'ID', 'CLOSE', 'CONTENT']);
    result[0].should.be_token("CONTENT", "foo ");
    result[4].should.be_token("CONTENT", " baz");
  });

  it('tokenizes a partial as "OPEN_PARTIAL ID CLOSE"', function() {
    var result = tokenize("{{> foo}}");
    result.should.match_tokens(['OPEN_PARTIAL', 'ID', 'CLOSE']);
  });

  it('tokenizes a partial with context as "OPEN_PARTIAL ID ID CLOSE"', function() {
    var result = tokenize("{{> foo bar }}");
    result.should.match_tokens(['OPEN_PARTIAL', 'ID', 'ID', 'CLOSE']);
  });

  it('tokenizes a partial without spaces as "OPEN_PARTIAL ID CLOSE"', function() {
    var result = tokenize("{{>foo}}");
    result.should.match_tokens(['OPEN_PARTIAL', 'ID', 'CLOSE']);
  });

  it('tokenizes a partial space at the }); as "OPEN_PARTIAL ID CLOSE"', function() {
    var result = tokenize("{{>foo  }}");
    result.should.match_tokens(['OPEN_PARTIAL', 'ID', 'CLOSE']);
  });

  it('tokenizes a partial space at the }); as "OPEN_PARTIAL ID CLOSE"', function() {
    var result = tokenize("{{>foo/bar.baz  }}");
    result.should.match_tokens(['OPEN_PARTIAL', 'ID', 'SEP', 'ID', 'SEP', 'ID', 'CLOSE']);
  });

  it('tokenizes a comment as "COMMENT"', function() {
    var result = tokenize("foo {{! this is a comment }} bar {{ baz }}");
    result.should.match_tokens(['CONTENT', 'COMMENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);
    result[1].should.be_token("COMMENT", " this is a comment ");
  });

  it('tokenizes a block comment as "COMMENT"', function() {
    var result = tokenize("foo {{!-- this is a {{comment}} --}} bar {{ baz }}");
    result.should.match_tokens(['CONTENT', 'COMMENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);
    result[1].should.be_token("COMMENT", " this is a {{comment}} ");
  });

  it('tokenizes a block comment with whitespace as "COMMENT"', function() {
    var result = tokenize("foo {{!-- this is a\n{{comment}}\n--}} bar {{ baz }}");
    result.should.match_tokens(['CONTENT', 'COMMENT', 'CONTENT', 'OPEN', 'ID', 'CLOSE']);
    result[1].should.be_token("COMMENT", " this is a\n{{comment}}\n");
  });

  it('tokenizes open and closing blocks as OPEN_BLOCK, ID, CLOSE ..., OPEN_ENDBLOCK ID CLOSE', function() {
    var result = tokenize("{{#foo}}content{{/foo}}");
    result.should.match_tokens(['OPEN_BLOCK', 'ID', 'CLOSE', 'CONTENT', 'OPEN_ENDBLOCK', 'ID', 'CLOSE']);
  });

  it('tokenizes inverse sections as "OPEN_INVERSE CLOSE"', function() {
    tokenize("{{^}}").should.match_tokens(['OPEN_INVERSE', 'CLOSE']);
    tokenize("{{else}}").should.match_tokens(['OPEN_INVERSE', 'CLOSE']);
    tokenize("{{ else }}").should.match_tokens(['OPEN_INVERSE', 'CLOSE']);
  });

  it('tokenizes inverse sections with ID as "OPEN_INVERSE ID CLOSE"', function() {
    var result = tokenize("{{^foo}}");
    result.should.match_tokens(['OPEN_INVERSE', 'ID', 'CLOSE']);
    result[1].should.be_token("ID", "foo");
  });

  it('tokenizes inverse sections with ID and spaces as "OPEN_INVERSE ID CLOSE"', function() {
    var result = tokenize("{{^ foo  }}");
    result.should.match_tokens(['OPEN_INVERSE', 'ID', 'CLOSE']);
    result[1].should.be_token("ID", "foo");
  });

  it('tokenizes mustaches with params as "OPEN ID ID ID CLOSE"', function() {
    var result = tokenize("{{ foo bar baz }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'ID', 'CLOSE']);
    result[1].should.be_token("ID", "foo");
    result[2].should.be_token("ID", "bar");
    result[3].should.be_token("ID", "baz");
  });

  it('tokenizes mustaches with String params as "OPEN ID ID STRING CLOSE"', function() {
    var result = tokenize("{{ foo bar \"baz\" }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'STRING', 'CLOSE']);
    result[3].should.be_token("STRING", "baz");
  });

  it('tokenizes mustaches with String params using single quotes as "OPEN ID ID STRING CLOSE"', function() {
    var result = tokenize("{{ foo bar \'baz\' }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'STRING', 'CLOSE']);
    result[3].should.be_token("STRING", "baz");
  });

  it('tokenizes String params with spaces inside as "STRING"', function() {
    var result = tokenize("{{ foo bar \"baz bat\" }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'STRING', 'CLOSE']);
    result[3].should.be_token("STRING", "baz bat");
  });

  it('tokenizes String params with escapes quotes as STRING', function() {
    var result = tokenize('{{ foo "bar\\"baz" }}');
    result.should.match_tokens(['OPEN', 'ID', 'STRING', 'CLOSE']);
    result[2].should.be_token("STRING", 'bar"baz');
  });

  it('tokenizes String params using single quotes with escapes quotes as STRING', function() {
    var result = tokenize("{{ foo 'bar\\'baz' }}");
    result.should.match_tokens(['OPEN', 'ID', 'STRING', 'CLOSE']);
    result[2].should.be_token("STRING", "bar'baz");
  });

  it('tokenizes numbers', function() {
    var result = tokenize('{{ foo 1 }}');
    result.should.match_tokens(['OPEN', 'ID', 'INTEGER', 'CLOSE']);
    result[2].should.be_token("INTEGER", "1");

    result = tokenize('{{ foo -1 }}');
    result.should.match_tokens(['OPEN', 'ID', 'INTEGER', 'CLOSE']);
    result[2].should.be_token("INTEGER", "-1");
  });

  it('tokenizes booleans', function() {
    var result = tokenize('{{ foo true }}');
    result.should.match_tokens(['OPEN', 'ID', 'BOOLEAN', 'CLOSE']);
    result[2].should.be_token("BOOLEAN", "true");

    result = tokenize('{{ foo false }}');
    result.should.match_tokens(['OPEN', 'ID', 'BOOLEAN', 'CLOSE']);
    result[2].should.be_token("BOOLEAN", "false");
  });

  it('tokenizes hash arguments', function() {
    var result = tokenize("{{ foo bar=baz }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'EQUALS', 'ID', 'CLOSE']);

    result = tokenize("{{ foo bar baz=bat }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'ID', 'CLOSE']);

    result = tokenize("{{ foo bar baz=1 }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'INTEGER', 'CLOSE']);

    result = tokenize("{{ foo bar baz=true }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'BOOLEAN', 'CLOSE']);

    result = tokenize("{{ foo bar baz=false }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'BOOLEAN', 'CLOSE']);

    result = tokenize("{{ foo bar\n  baz=bat }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'ID', 'CLOSE']);

    result = tokenize("{{ foo bar baz=\"bat\" }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'STRING', 'CLOSE']);

    result = tokenize("{{ foo bar baz=\"bat\" bam=wot }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'STRING', 'ID', 'EQUALS', 'ID', 'CLOSE']);

    result = tokenize("{{foo omg bar=baz bat=\"bam\"}}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'ID', 'EQUALS', 'ID', 'ID', 'EQUALS', 'STRING', 'CLOSE']);
    result[2].should.be_token("ID", "omg");
  });

  it('tokenizes special @ identifiers', function() {
    var result = tokenize("{{ @foo }}");
    result.should.match_tokens(['OPEN', 'DATA', 'ID', 'CLOSE']);
    result[2].should.be_token("ID", "foo");

    result = tokenize("{{ foo @bar }}");
    result.should.match_tokens(['OPEN', 'ID', 'DATA', 'ID', 'CLOSE']);
    result[3].should.be_token("ID", "bar");

    result = tokenize("{{ foo bar=@baz }}");
    result.should.match_tokens(['OPEN', 'ID', 'ID', 'EQUALS', 'DATA', 'ID', 'CLOSE']);
    result[5].should.be_token("ID", "baz");
  });

  it('does not time out in a mustache with a single } followed by EOF', function() {
    tokenize("{{foo}").should.match_tokens(['OPEN', 'ID']);
  });

  it('does not time out in a mustache when invalid ID characters are used', function() {
    tokenize("{{foo & }}").should.match_tokens(['OPEN', 'ID']);
  });
});
