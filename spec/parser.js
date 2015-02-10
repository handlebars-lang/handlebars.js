/*global Handlebars, shouldThrow */
describe('parser', function() {
  if (!Handlebars.print) {
    return;
  }

  function ast_for(template) {
    var ast = Handlebars.parse(template);
    return Handlebars.print(ast);
  }

  it('parses simple mustaches', function() {
    equals(ast_for('{{123}}'), "{{ NUMBER{123} [] }}\n");
    equals(ast_for('{{"foo"}}'), '{{ "foo" [] }}\n');
    equals(ast_for('{{false}}'), '{{ BOOLEAN{false} [] }}\n');
    equals(ast_for('{{true}}'), '{{ BOOLEAN{true} [] }}\n');
    equals(ast_for('{{foo}}'), "{{ PATH:foo [] }}\n");
    equals(ast_for('{{foo?}}'), "{{ PATH:foo? [] }}\n");
    equals(ast_for('{{foo_}}'), "{{ PATH:foo_ [] }}\n");
    equals(ast_for('{{foo-}}'), "{{ PATH:foo- [] }}\n");
    equals(ast_for('{{foo:}}'), "{{ PATH:foo: [] }}\n");
  });

  it('parses simple mustaches with data', function() {
    equals(ast_for("{{@foo}}"), "{{ @PATH:foo [] }}\n");
  });

  it('parses simple mustaches with data paths', function() {
    equals(ast_for("{{@../foo}}"), "{{ @PATH:foo [] }}\n");
  });

  it('parses mustaches with paths', function() {
    equals(ast_for("{{foo/bar}}"), "{{ PATH:foo/bar [] }}\n");
  });

  it('parses mustaches with this/foo', function() {
    equals(ast_for("{{this/foo}}"), "{{ PATH:foo [] }}\n");
  });

  it('parses mustaches with - in a path', function() {
    equals(ast_for("{{foo-bar}}"), "{{ PATH:foo-bar [] }}\n");
  });

  it('parses mustaches with parameters', function() {
    equals(ast_for("{{foo bar}}"), "{{ PATH:foo [PATH:bar] }}\n");
  });

  it('parses mustaches with string parameters', function() {
    equals(ast_for("{{foo bar \"baz\" }}"), '{{ PATH:foo [PATH:bar, "baz"] }}\n');
  });

  it('parses mustaches with NUMBER parameters', function() {
    equals(ast_for("{{foo 1}}"), "{{ PATH:foo [NUMBER{1}] }}\n");
  });

  it('parses mustaches with BOOLEAN parameters', function() {
    equals(ast_for("{{foo true}}"), "{{ PATH:foo [BOOLEAN{true}] }}\n");
    equals(ast_for("{{foo false}}"), "{{ PATH:foo [BOOLEAN{false}] }}\n");
  });

  it('parses mutaches with DATA parameters', function() {
    equals(ast_for("{{foo @bar}}"), "{{ PATH:foo [@PATH:bar] }}\n");
  });

  it('parses mustaches with hash arguments', function() {
    equals(ast_for("{{foo bar=baz}}"), "{{ PATH:foo [] HASH{bar=PATH:baz} }}\n");
    equals(ast_for("{{foo bar=1}}"), "{{ PATH:foo [] HASH{bar=NUMBER{1}} }}\n");
    equals(ast_for("{{foo bar=true}}"), "{{ PATH:foo [] HASH{bar=BOOLEAN{true}} }}\n");
    equals(ast_for("{{foo bar=false}}"), "{{ PATH:foo [] HASH{bar=BOOLEAN{false}} }}\n");
    equals(ast_for("{{foo bar=@baz}}"), "{{ PATH:foo [] HASH{bar=@PATH:baz} }}\n");

    equals(ast_for("{{foo bar=baz bat=bam}}"), "{{ PATH:foo [] HASH{bar=PATH:baz, bat=PATH:bam} }}\n");
    equals(ast_for("{{foo bar=baz bat=\"bam\"}}"), '{{ PATH:foo [] HASH{bar=PATH:baz, bat="bam"} }}\n');

    equals(ast_for("{{foo bat='bam'}}"), '{{ PATH:foo [] HASH{bat="bam"} }}\n');

    equals(ast_for("{{foo omg bar=baz bat=\"bam\"}}"), '{{ PATH:foo [PATH:omg] HASH{bar=PATH:baz, bat="bam"} }}\n');
    equals(ast_for("{{foo omg bar=baz bat=\"bam\" baz=1}}"), '{{ PATH:foo [PATH:omg] HASH{bar=PATH:baz, bat="bam", baz=NUMBER{1}} }}\n');
    equals(ast_for("{{foo omg bar=baz bat=\"bam\" baz=true}}"), '{{ PATH:foo [PATH:omg] HASH{bar=PATH:baz, bat="bam", baz=BOOLEAN{true}} }}\n');
    equals(ast_for("{{foo omg bar=baz bat=\"bam\" baz=false}}"), '{{ PATH:foo [PATH:omg] HASH{bar=PATH:baz, bat="bam", baz=BOOLEAN{false}} }}\n');
  });

  it('parses contents followed by a mustache', function() {
    equals(ast_for("foo bar {{baz}}"), "CONTENT[ \'foo bar \' ]\n{{ PATH:baz [] }}\n");
  });

  it('parses a partial', function() {
    equals(ast_for("{{> foo }}"), "{{> PARTIAL:foo }}\n");
    equals(ast_for("{{> 'foo' }}"), "{{> PARTIAL:foo }}\n");
    equals(ast_for("{{> 1 }}"), "{{> PARTIAL:1 }}\n");
  });

  it('parses a partial with context', function() {
    equals(ast_for("{{> foo bar}}"), "{{> PARTIAL:foo PATH:bar }}\n");
  });

  it('parses a partial with hash', function() {
    equals(ast_for("{{> foo bar=bat}}"), "{{> PARTIAL:foo HASH{bar=PATH:bat} }}\n");
  });

  it('parses a partial with context and hash', function() {
    equals(ast_for("{{> foo bar bat=baz}}"), "{{> PARTIAL:foo PATH:bar HASH{bat=PATH:baz} }}\n");
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
    equals(ast_for("{{#foo}} bar {{^}} baz {{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    CONTENT[ ' baz ' ]\n");
  });

  it('parses an inverse (else-style) section', function() {
    equals(ast_for("{{#foo}} bar {{else}} baz {{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    CONTENT[ ' baz ' ]\n");
  });

  it('parses multiple inverse sections', function() {
    equals(ast_for("{{#foo}} bar {{else if bar}}{{else}} baz {{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    BLOCK:\n      PATH:if [PATH:bar]\n      PROGRAM:\n      {{^}}\n        CONTENT[ ' baz ' ]\n");
  });

  it('parses empty blocks', function() {
    equals(ast_for("{{#foo}}{{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n");
  });

  it('parses empty blocks with empty inverse section', function() {
    equals(ast_for("{{#foo}}{{^}}{{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n");
  });

  it('parses empty blocks with empty inverse (else-style) section', function() {
    equals(ast_for("{{#foo}}{{else}}{{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n");
  });

  it('parses non-empty blocks with empty inverse section', function() {
    equals(ast_for("{{#foo}} bar {{^}}{{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n");
  });

  it('parses non-empty blocks with empty inverse (else-style) section', function() {
    equals(ast_for("{{#foo}} bar {{else}}{{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n");
  });

  it('parses empty blocks with non-empty inverse section', function() {
    equals(ast_for("{{#foo}}{{^}} bar {{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n    CONTENT[ ' bar ' ]\n");
  });

  it('parses empty blocks with non-empty inverse (else-style) section', function() {
    equals(ast_for("{{#foo}}{{else}} bar {{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n    CONTENT[ ' bar ' ]\n");
  });

  it('parses a standalone inverse section', function() {
    equals(ast_for("{{^foo}}bar{{/foo}}"), "BLOCK:\n  PATH:foo []\n  {{^}}\n    CONTENT[ 'bar' ]\n");
  });
  it('throws on old inverse section', function() {
    shouldThrow(function() {
      ast_for("{{else foo}}bar{{/foo}}");
    }, Error);
  });

  it('parses block with block params', function() {
    equals(ast_for("{{#foo as |bar baz|}}content{{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    BLOCK PARAMS: [ bar baz ]\n    CONTENT[ 'content' ]\n");
  });

  it('parses inverse block with block params', function() {
    equals(ast_for("{{^foo as |bar baz|}}content{{/foo}}"), "BLOCK:\n  PATH:foo []\n  {{^}}\n    BLOCK PARAMS: [ bar baz ]\n    CONTENT[ 'content' ]\n");
  });
  it('parses chained inverse block with block params', function() {
    equals(ast_for("{{#foo}}{{else foo as |bar baz|}}content{{/foo}}"), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n    BLOCK:\n      PATH:foo []\n      PROGRAM:\n        BLOCK PARAMS: [ bar baz ]\n        CONTENT[ 'content' ]\n");
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

    shouldThrow(function() {
      ast_for("{{{{goodbyes}}}} {{{{/hellos}}}}");
    }, Error, /goodbyes doesn't match hellos/);
  });

  it('should handle invalid paths', function() {
    shouldThrow(function() {
      ast_for("{{foo/../bar}}");
    }, Error, /Invalid path: foo\/\.\. - 1:2/);
    shouldThrow(function() {
      ast_for("{{foo/./bar}}");
    }, Error, /Invalid path: foo\/\. - 1:2/);
    shouldThrow(function() {
      ast_for("{{foo/this/bar}}");
    }, Error, /Invalid path: foo\/this - 1:2/);
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
      equals(ast_for(new Handlebars.AST.Program([new Handlebars.AST.ContentStatement("Hello")], null)), "CONTENT[ \'Hello\' ]\n");
    });
  });
});
