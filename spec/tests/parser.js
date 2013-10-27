describe('parser', function() {
  if (!Handlebars.print) {
    return;
  }

  function ast_for(template) {
    var ast = Handlebars.parse(template);
    return Handlebars.print(ast);
  }

  it('parses simple mustaches', function() {
    ast_for('{{foo}}').should.equal("{{ ID:foo [] }}\n");
    ast_for('{{foo?}}').should.equal("{{ ID:foo? [] }}\n");
    ast_for('{{foo_}}').should.equal("{{ ID:foo_ [] }}\n");
    ast_for('{{foo-}}').should.equal("{{ ID:foo- [] }}\n");
    ast_for('{{foo:}}').should.equal("{{ ID:foo: [] }}\n");
  });

  it('parses simple mustaches with data', function() {
    ast_for("{{@foo}}").should.equal("{{ @ID:foo [] }}\n");
  });

  it('parses mustaches with paths', function() {
    ast_for("{{foo/bar}}").should.equal("{{ PATH:foo/bar [] }}\n");
  });

  it('parses mustaches with this/foo', function() {
    ast_for("{{this/foo}}").should.equal("{{ ID:foo [] }}\n");
  });

  it('parses mustaches with - in a path', function() {
    ast_for("{{foo-bar}}").should.equal("{{ ID:foo-bar [] }}\n");
  });

  it('parses mustaches with parameters', function() {
    ast_for("{{foo bar}}").should.equal("{{ ID:foo [ID:bar] }}\n");
  });

  it('parses mustaches with string parameters', function() {
    ast_for("{{foo bar \"baz\" }}").should.equal('{{ ID:foo [ID:bar, "baz"] }}\n');
  });

  it('parses mustaches with INTEGER parameters', function() {
    ast_for("{{foo 1}}").should.equal("{{ ID:foo [INTEGER{1}] }}\n");
  });

  it('parses mustaches with BOOLEAN parameters', function() {
    ast_for("{{foo true}}").should.equal("{{ ID:foo [BOOLEAN{true}] }}\n");
    ast_for("{{foo false}}").should.equal("{{ ID:foo [BOOLEAN{false}] }}\n");
  });

  it('parses mutaches with DATA parameters', function() {
    ast_for("{{foo @bar}}").should.equal("{{ ID:foo [@ID:bar] }}\n");
  });

  it('parses mustaches with hash arguments', function() {
    ast_for("{{foo bar=baz}}").should.equal("{{ ID:foo [] HASH{bar=ID:baz} }}\n");
    ast_for("{{foo bar=1}}").should.equal("{{ ID:foo [] HASH{bar=INTEGER{1}} }}\n");
    ast_for("{{foo bar=true}}").should.equal("{{ ID:foo [] HASH{bar=BOOLEAN{true}} }}\n");
    ast_for("{{foo bar=false}}").should.equal("{{ ID:foo [] HASH{bar=BOOLEAN{false}} }}\n");
    ast_for("{{foo bar=@baz}}").should.equal("{{ ID:foo [] HASH{bar=@ID:baz} }}\n");

    ast_for("{{foo bar=baz bat=bam}}").should.equal("{{ ID:foo [] HASH{bar=ID:baz, bat=ID:bam} }}\n");
    ast_for("{{foo bar=baz bat=\"bam\"}}").should.equal('{{ ID:foo [] HASH{bar=ID:baz, bat="bam"} }}\n');

    ast_for("{{foo bat='bam'}}").should.equal('{{ ID:foo [] HASH{bat="bam"} }}\n');

    ast_for("{{foo omg bar=baz bat=\"bam\"}}").should.equal('{{ ID:foo [ID:omg] HASH{bar=ID:baz, bat="bam"} }}\n');
    ast_for("{{foo omg bar=baz bat=\"bam\" baz=1}}").should.equal('{{ ID:foo [ID:omg] HASH{bar=ID:baz, bat="bam", baz=INTEGER{1}} }}\n');
    ast_for("{{foo omg bar=baz bat=\"bam\" baz=true}}").should.equal('{{ ID:foo [ID:omg] HASH{bar=ID:baz, bat="bam", baz=BOOLEAN{true}} }}\n');
    ast_for("{{foo omg bar=baz bat=\"bam\" baz=false}}").should.equal('{{ ID:foo [ID:omg] HASH{bar=ID:baz, bat="bam", baz=BOOLEAN{false}} }}\n');
  });

  it('parses contents followed by a mustache', function() {
    ast_for("foo bar {{baz}}").should.equal("CONTENT[ \'foo bar \' ]\n{{ ID:baz [] }}\n");
  });

  it('parses a partial', function() {
    ast_for("{{> foo }}").should.equal("{{> PARTIAL:foo }}\n");
  });

  it('parses a partial with context', function() {
    ast_for("{{> foo bar}}").should.equal("{{> PARTIAL:foo ID:bar }}\n");
  });

  it('parses a partial with a complex name', function() {
    ast_for("{{> shared/partial?.bar}}").should.equal("{{> PARTIAL:shared/partial?.bar }}\n");
  });

  it('parses a comment', function() {
    ast_for("{{! this is a comment }}").should.equal("{{! ' this is a comment ' }}\n");
  });

  it('parses a multi-line comment', function() {
    ast_for("{{!\nthis is a multi-line comment\n}}").should.equal("{{! \'\nthis is a multi-line comment\n\' }}\n");
  });

  it('parses an inverse section', function() {
    ast_for("{{#foo}} bar {{^}} baz {{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    CONTENT[ ' baz ' ]\n");
  });

  it('parses an inverse (else-style) section', function() {
    ast_for("{{#foo}} bar {{else}} baz {{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    CONTENT[ ' baz ' ]\n");
  });

  it('parses empty blocks', function() {
    ast_for("{{#foo}}{{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n");
  });

  it('parses empty blocks with empty inverse section', function() {
    ast_for("{{#foo}}{{^}}{{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n");
  });

  it('parses empty blocks with empty inverse (else-style) section', function() {
    ast_for("{{#foo}}{{else}}{{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n");
  });

  it('parses non-empty blocks with empty inverse section', function() {
    ast_for("{{#foo}} bar {{^}}{{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n");
  });

  it('parses non-empty blocks with empty inverse (else-style) section', function() {
    ast_for("{{#foo}} bar {{else}}{{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n");
  });

  it('parses empty blocks with non-empty inverse section', function() {
    ast_for("{{#foo}}{{^}} bar {{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n  {{^}}\n    CONTENT[ ' bar ' ]\n");
  });

  it('parses empty blocks with non-empty inverse (else-style) section', function() {
    ast_for("{{#foo}}{{else}} bar {{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n  {{^}}\n    CONTENT[ ' bar ' ]\n");
  });

  it('parses a standalone inverse section', function() {
    ast_for("{{^foo}}bar{{/foo}}").should.equal("BLOCK:\n  {{ ID:foo [] }}\n  {{^}}\n    CONTENT[ 'bar' ]\n");
  });

  it("raises if there's a Parse error", function() {
    (function() {
      ast_for("foo{{^}}bar");
    }).should.throw(/Parse error on line 1/);
    (function() {
      ast_for("{{foo}");
    }).should.throw(/Parse error on line 1/);
    (function() {
      ast_for("{{foo &}}");
    }).should.throw(/Parse error on line 1/);
    (function() {
      ast_for("{{#goodbyes}}{{/hellos}}");
    }).should.throw(/goodbyes doesn't match hellos/);
  });

  it('knows how to report the correct line number in errors', function() {
    (function() {
      ast_for("hello\nmy\n{{foo}");
    }).should.throw(/Parse error on line 3/);
    (function() {
      ast_for("hello\n\nmy\n\n{{foo}");
    }).should.throw(/Parse error on line 5/);
  });

  it('knows how to report the correct line number in errors when the first character is a newline', function() {
    (function() {
      ast_for("\n\nhello\n\nmy\n\n{{foo}");
    }).should.throw(/Parse error on line 7/);
  });

  describe('externally compiled AST', function() {
    it('can pass through an already-compiled AST', function() {
      ast_for(new Handlebars.AST.ProgramNode([ new Handlebars.AST.ContentNode("Hello")])).should.equal("CONTENT[ \'Hello\' ]\n");
    });
  });
});
