/*global Handlebars */
describe('parser', function() {
  if (!Handlebars.print) {
    return;
  }

  function ast_for(template) {
    var ast = Handlebars.parse(template);
    return Handlebars.print(ast);
  }

  it('parses simple mustaches', function() {
    equals(ast_for('{{foo}}'), "{{ ID:foo [] }}\n");
    equals(ast_for('{{foo?}}'), "{{ ID:foo? [] }}\n");
    equals(ast_for('{{foo_}}'), "{{ ID:foo_ [] }}\n");
    equals(ast_for('{{foo-}}'), "{{ ID:foo- [] }}\n");
    equals(ast_for('{{foo:}}'), "{{ ID:foo: [] }}\n");
  });

  it('parses simple mustaches with data', function() {
    equals(ast_for("{{@foo}}"), "{{ @ID:foo [] }}\n");
  });

  it('parses mustaches with paths', function() {
    equals(ast_for("{{foo/bar}}"), "{{ PATH:foo/bar [] }}\n");
  });

  it('parses mustaches with this/foo', function() {
    equals(ast_for("{{this/foo}}"), "{{ ID:foo [] }}\n");
  });

  it('parses mustaches with - in a path', function() {
    equals(ast_for("{{foo-bar}}"), "{{ ID:foo-bar [] }}\n");
  });

  it('parses mustaches with parameters', function() {
    equals(ast_for("{{foo bar}}"), "{{ ID:foo [ID:bar] }}\n");
  });

  it('parses mustaches with string parameters', function() {
    equals(ast_for("{{foo bar \"baz\" }}"), '{{ ID:foo [ID:bar, "baz"] }}\n');
  });

  it('parses mustaches with INTEGER parameters', function() {
    equals(ast_for("{{foo 1}}"), "{{ ID:foo [INTEGER{1}] }}\n");
  });

  it('parses mustaches with BOOLEAN parameters', function() {
    equals(ast_for("{{foo true}}"), "{{ ID:foo [BOOLEAN{true}] }}\n");
    equals(ast_for("{{foo false}}"), "{{ ID:foo [BOOLEAN{false}] }}\n");
  });

  it('parses mutaches with DATA parameters', function() {
    equals(ast_for("{{foo @bar}}"), "{{ ID:foo [@ID:bar] }}\n");
  });

  it('parses mustaches with hash arguments', function() {
    equals(ast_for("{{foo bar=baz}}"), "{{ ID:foo [] HASH{bar=ID:baz} }}\n");
    equals(ast_for("{{foo bar=1}}"), "{{ ID:foo [] HASH{bar=INTEGER{1}} }}\n");
    equals(ast_for("{{foo bar=true}}"), "{{ ID:foo [] HASH{bar=BOOLEAN{true}} }}\n");
    equals(ast_for("{{foo bar=false}}"), "{{ ID:foo [] HASH{bar=BOOLEAN{false}} }}\n");
    equals(ast_for("{{foo bar=@baz}}"), "{{ ID:foo [] HASH{bar=@ID:baz} }}\n");

    equals(ast_for("{{foo bar=baz bat=bam}}"), "{{ ID:foo [] HASH{bar=ID:baz, bat=ID:bam} }}\n");
    equals(ast_for("{{foo bar=baz bat=\"bam\"}}"), '{{ ID:foo [] HASH{bar=ID:baz, bat="bam"} }}\n');

    equals(ast_for("{{foo bat='bam'}}"), '{{ ID:foo [] HASH{bat="bam"} }}\n');

    equals(ast_for("{{foo omg bar=baz bat=\"bam\"}}"), '{{ ID:foo [ID:omg] HASH{bar=ID:baz, bat="bam"} }}\n');
    equals(ast_for("{{foo omg bar=baz bat=\"bam\" baz=1}}"), '{{ ID:foo [ID:omg] HASH{bar=ID:baz, bat="bam", baz=INTEGER{1}} }}\n');
    equals(ast_for("{{foo omg bar=baz bat=\"bam\" baz=true}}"), '{{ ID:foo [ID:omg] HASH{bar=ID:baz, bat="bam", baz=BOOLEAN{true}} }}\n');
    equals(ast_for("{{foo omg bar=baz bat=\"bam\" baz=false}}"), '{{ ID:foo [ID:omg] HASH{bar=ID:baz, bat="bam", baz=BOOLEAN{false}} }}\n');
  });

  it('parses contents followed by a mustache', function() {
    equals(ast_for("foo bar {{baz}}"), "CONTENT[ \'foo bar \' ]\n{{ ID:baz [] }}\n");
  });

  it('parses a partial', function() {
    equals(ast_for("{{> foo }}"), "{{> PARTIAL:foo }}\n");
  });

  it('parses a partial with context', function() {
    equals(ast_for("{{> foo bar}}"), "{{> PARTIAL:foo ID:bar }}\n");
  });

  it('parses a partial with a complex name', function() {
    equals(ast_for("{{> shared/partial?.bar}}"), "{{> PARTIAL:shared/partial?.bar }}\n");
  });

  it('parses a comment', function() {
    equals(ast_for("{{! this is a comment }}"), "{{! ' this is a comment ' }}\n");
  });

  it('parses a multi-line comment', function() {
    equals(ast_for("{{!\nthis is a multi-line comment\n}}"), "{{! \'\nthis is a multi-line comment\n\' }}\n");
  });

  it('parses an inverse section', function() {
    equals(ast_for("{{#foo}} bar {{^}} baz {{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    CONTENT[ ' baz ' ]\n");
  });

  it('parses an inverse (else-style) section', function() {
    equals(ast_for("{{#foo}} bar {{else}} baz {{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    CONTENT[ ' baz ' ]\n");
  });

  it('parses empty blocks', function() {
    equals(ast_for("{{#foo}}{{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n");
  });

  it('parses empty blocks with empty inverse section', function() {
    equals(ast_for("{{#foo}}{{^}}{{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n");
  });

  it('parses empty blocks with empty inverse (else-style) section', function() {
    equals(ast_for("{{#foo}}{{else}}{{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n");
  });

  it('parses non-empty blocks with empty inverse section', function() {
    equals(ast_for("{{#foo}} bar {{^}}{{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n");
  });

  it('parses non-empty blocks with empty inverse (else-style) section', function() {
    equals(ast_for("{{#foo}} bar {{else}}{{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n");
  });

  it('parses empty blocks with non-empty inverse section', function() {
    equals(ast_for("{{#foo}}{{^}} bar {{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n  {{^}}\n    CONTENT[ ' bar ' ]\n");
  });

  it('parses empty blocks with non-empty inverse (else-style) section', function() {
    equals(ast_for("{{#foo}}{{else}} bar {{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  PROGRAM:\n  {{^}}\n    CONTENT[ ' bar ' ]\n");
  });

  it('parses a standalone inverse section', function() {
    equals(ast_for("{{^foo}}bar{{/foo}}"), "BLOCK:\n  {{ ID:foo [] }}\n  {{^}}\n    CONTENT[ 'bar' ]\n");
  });

  it("raises if there's a Parse error", function() {
    shouldThrow(function() {
      ast_for("foo{{^}}bar");
    }, Error, /Parse error on line 1/);
    shouldThrow(function() {
      ast_for("{{foo}");
    }, Error, /Parse error on line 1/);
    shouldThrow(function() {
      ast_for("{{foo &}}");
    }, Error, /Parse error on line 1/);
    shouldThrow(function() {
      ast_for("{{#goodbyes}}{{/hellos}}");
    }, Error, /goodbyes doesn't match hellos/);
  });

  it('knows how to report the correct line number in errors', function() {
    shouldThrow(function() {
      ast_for("hello\nmy\n{{foo}");
    }, Error, /Parse error on line 3/);
    shouldThrow(function() {
      ast_for("hello\n\nmy\n\n{{foo}");
    }, Error, /Parse error on line 5/);
  });

  it('knows how to report the correct line number in errors when the first character is a newline', function() {
    shouldThrow(function() {
      ast_for("\n\nhello\n\nmy\n\n{{foo}");
    }, Error, /Parse error on line 7/);
  });

  describe('externally compiled AST', function() {
    it('can pass through an already-compiled AST', function() {
      equals(ast_for(new Handlebars.AST.ProgramNode([ new Handlebars.AST.ContentNode("Hello")])), "CONTENT[ \'Hello\' ]\n");
    });
  });
});
