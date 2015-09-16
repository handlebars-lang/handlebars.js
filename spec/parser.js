describe('parser', function() {
  if (!Handlebars.print) {
    return;
  }

  function astFor(template) {
    var ast = Handlebars.parse(template);
    return Handlebars.print(ast);
  }

  it('parses simple mustaches', function() {
    equals(astFor('{{123}}'), '{{ NUMBER{123} [] }}\n');
    equals(astFor('{{"foo"}}'), '{{ "foo" [] }}\n');
    equals(astFor('{{false}}'), '{{ BOOLEAN{false} [] }}\n');
    equals(astFor('{{true}}'), '{{ BOOLEAN{true} [] }}\n');
    equals(astFor('{{foo}}'), '{{ PATH:foo [] }}\n');
    equals(astFor('{{foo?}}'), '{{ PATH:foo? [] }}\n');
    equals(astFor('{{foo_}}'), '{{ PATH:foo_ [] }}\n');
    equals(astFor('{{foo-}}'), '{{ PATH:foo- [] }}\n');
    equals(astFor('{{foo:}}'), '{{ PATH:foo: [] }}\n');
  });

  it('parses simple mustaches with data', function() {
    equals(astFor('{{@foo}}'), '{{ @PATH:foo [] }}\n');
  });

  it('parses simple mustaches with data paths', function() {
    equals(astFor('{{@../foo}}'), '{{ @PATH:foo [] }}\n');
  });

  it('parses mustaches with paths', function() {
    equals(astFor('{{foo/bar}}'), '{{ PATH:foo/bar [] }}\n');
  });

  it('parses mustaches with this/foo', function() {
    equals(astFor('{{this/foo}}'), '{{ PATH:foo [] }}\n');
  });

  it('parses mustaches with - in a path', function() {
    equals(astFor('{{foo-bar}}'), '{{ PATH:foo-bar [] }}\n');
  });
  it('parses mustaches with escaped [] in a path', function() {
    equals(astFor('{{[foo[\\]]}}'), '{{ PATH:foo[] [] }}\n');
  });
  it('parses escaped \\\\ in path', function() {
    equals(astFor('{{[foo\\\\]}}'), '{{ PATH:foo\\ [] }}\n');
  });

  it('parses mustaches with parameters', function() {
    equals(astFor('{{foo bar}}'), '{{ PATH:foo [PATH:bar] }}\n');
  });

  it('parses mustaches with string parameters', function() {
    equals(astFor('{{foo bar \"baz\" }}'), '{{ PATH:foo [PATH:bar, "baz"] }}\n');
  });

  it('parses mustaches with NUMBER parameters', function() {
    equals(astFor('{{foo 1}}'), '{{ PATH:foo [NUMBER{1}] }}\n');
  });

  it('parses mustaches with BOOLEAN parameters', function() {
    equals(astFor('{{foo true}}'), '{{ PATH:foo [BOOLEAN{true}] }}\n');
    equals(astFor('{{foo false}}'), '{{ PATH:foo [BOOLEAN{false}] }}\n');
  });

  it('parses mustaches with undefined and null paths', function() {
    equals(astFor('{{undefined}}'), '{{ UNDEFINED [] }}\n');
    equals(astFor('{{null}}'), '{{ NULL [] }}\n');
  });
  it('parses mustaches with undefined and null parameters', function() {
    equals(astFor('{{foo undefined null}}'), '{{ PATH:foo [UNDEFINED, NULL] }}\n');
  });

  it('parses mustaches with DATA parameters', function() {
    equals(astFor('{{foo @bar}}'), '{{ PATH:foo [@PATH:bar] }}\n');
  });

  it('parses mustaches with hash arguments', function() {
    equals(astFor('{{foo bar=baz}}'), '{{ PATH:foo [] HASH{bar=PATH:baz} }}\n');
    equals(astFor('{{foo bar=1}}'), '{{ PATH:foo [] HASH{bar=NUMBER{1}} }}\n');
    equals(astFor('{{foo bar=true}}'), '{{ PATH:foo [] HASH{bar=BOOLEAN{true}} }}\n');
    equals(astFor('{{foo bar=false}}'), '{{ PATH:foo [] HASH{bar=BOOLEAN{false}} }}\n');
    equals(astFor('{{foo bar=@baz}}'), '{{ PATH:foo [] HASH{bar=@PATH:baz} }}\n');

    equals(astFor('{{foo bar=baz bat=bam}}'), '{{ PATH:foo [] HASH{bar=PATH:baz, bat=PATH:bam} }}\n');
    equals(astFor('{{foo bar=baz bat="bam"}}'), '{{ PATH:foo [] HASH{bar=PATH:baz, bat="bam"} }}\n');

    equals(astFor("{{foo bat='bam'}}"), '{{ PATH:foo [] HASH{bat="bam"} }}\n');

    equals(astFor('{{foo omg bar=baz bat=\"bam\"}}'), '{{ PATH:foo [PATH:omg] HASH{bar=PATH:baz, bat="bam"} }}\n');
    equals(astFor('{{foo omg bar=baz bat=\"bam\" baz=1}}'), '{{ PATH:foo [PATH:omg] HASH{bar=PATH:baz, bat="bam", baz=NUMBER{1}} }}\n');
    equals(astFor('{{foo omg bar=baz bat=\"bam\" baz=true}}'), '{{ PATH:foo [PATH:omg] HASH{bar=PATH:baz, bat="bam", baz=BOOLEAN{true}} }}\n');
    equals(astFor('{{foo omg bar=baz bat=\"bam\" baz=false}}'), '{{ PATH:foo [PATH:omg] HASH{bar=PATH:baz, bat="bam", baz=BOOLEAN{false}} }}\n');
  });

  it('parses contents followed by a mustache', function() {
    equals(astFor('foo bar {{baz}}'), 'CONTENT[ \'foo bar \' ]\n{{ PATH:baz [] }}\n');
  });

  it('parses a partial', function() {
    equals(astFor('{{> foo }}'), '{{> PARTIAL:foo }}\n');
    equals(astFor('{{> "foo" }}'), '{{> PARTIAL:foo }}\n');
    equals(astFor('{{> 1 }}'), '{{> PARTIAL:1 }}\n');
  });

  it('parses a partial with context', function() {
    equals(astFor('{{> foo bar}}'), '{{> PARTIAL:foo PATH:bar }}\n');
  });

  it('parses a partial with hash', function() {
    equals(astFor('{{> foo bar=bat}}'), '{{> PARTIAL:foo HASH{bar=PATH:bat} }}\n');
  });

  it('parses a partial with context and hash', function() {
    equals(astFor('{{> foo bar bat=baz}}'), '{{> PARTIAL:foo PATH:bar HASH{bat=PATH:baz} }}\n');
  });

  it('parses a partial with a complex name', function() {
    equals(astFor('{{> shared/partial?.bar}}'), '{{> PARTIAL:shared/partial?.bar }}\n');
  });

  it('parsers partial blocks', function() {
    equals(astFor('{{#> foo}}bar{{/foo}}'), '{{> PARTIAL BLOCK:foo PROGRAM:\n  CONTENT[ \'bar\' ]\n }}\n');
  });
  it('should handle parser block mismatch', function() {
    shouldThrow(function() {
      astFor('{{#> goodbyes}}{{/hellos}}');
    }, Error, (/goodbyes doesn't match hellos/));
  });
  it('parsers partial blocks with arguments', function() {
    equals(astFor('{{#> foo context hash=value}}bar{{/foo}}'), '{{> PARTIAL BLOCK:foo PATH:context HASH{hash=PATH:value} PROGRAM:\n  CONTENT[ \'bar\' ]\n }}\n');
  });

  it('parses a comment', function() {
    equals(astFor('{{! this is a comment }}'), "{{! ' this is a comment ' }}\n");
  });

  it('parses a multi-line comment', function() {
    equals(astFor('{{!\nthis is a multi-line comment\n}}'), "{{! \'\nthis is a multi-line comment\n\' }}\n");
  });

  it('parses an inverse section', function() {
    equals(astFor('{{#foo}} bar {{^}} baz {{/foo}}'), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    CONTENT[ ' baz ' ]\n");
  });

  it('parses an inverse (else-style) section', function() {
    equals(astFor('{{#foo}} bar {{else}} baz {{/foo}}'), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    CONTENT[ ' baz ' ]\n");
  });

  it('parses multiple inverse sections', function() {
    equals(astFor('{{#foo}} bar {{else if bar}}{{else}} baz {{/foo}}'), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n    BLOCK:\n      PATH:if [PATH:bar]\n      PROGRAM:\n      {{^}}\n        CONTENT[ ' baz ' ]\n");
  });

  it('parses empty blocks', function() {
    equals(astFor('{{#foo}}{{/foo}}'), 'BLOCK:\n  PATH:foo []\n  PROGRAM:\n');
  });

  it('parses empty blocks with empty inverse section', function() {
    equals(astFor('{{#foo}}{{^}}{{/foo}}'), 'BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n');
  });

  it('parses empty blocks with empty inverse (else-style) section', function() {
    equals(astFor('{{#foo}}{{else}}{{/foo}}'), 'BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n');
  });

  it('parses non-empty blocks with empty inverse section', function() {
    equals(astFor('{{#foo}} bar {{^}}{{/foo}}'), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n");
  });

  it('parses non-empty blocks with empty inverse (else-style) section', function() {
    equals(astFor('{{#foo}} bar {{else}}{{/foo}}'), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    CONTENT[ ' bar ' ]\n  {{^}}\n");
  });

  it('parses empty blocks with non-empty inverse section', function() {
    equals(astFor('{{#foo}}{{^}} bar {{/foo}}'), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n    CONTENT[ ' bar ' ]\n");
  });

  it('parses empty blocks with non-empty inverse (else-style) section', function() {
    equals(astFor('{{#foo}}{{else}} bar {{/foo}}'), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n    CONTENT[ ' bar ' ]\n");
  });

  it('parses a standalone inverse section', function() {
    equals(astFor('{{^foo}}bar{{/foo}}'), "BLOCK:\n  PATH:foo []\n  {{^}}\n    CONTENT[ 'bar' ]\n");
  });
  it('throws on old inverse section', function() {
    shouldThrow(function() {
      astFor('{{else foo}}bar{{/foo}}');
    }, Error);
  });

  it('parses block with block params', function() {
    equals(astFor('{{#foo as |bar baz|}}content{{/foo}}'), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n    BLOCK PARAMS: [ bar baz ]\n    CONTENT[ 'content' ]\n");
  });

  it('parses inverse block with block params', function() {
    equals(astFor('{{^foo as |bar baz|}}content{{/foo}}'), "BLOCK:\n  PATH:foo []\n  {{^}}\n    BLOCK PARAMS: [ bar baz ]\n    CONTENT[ 'content' ]\n");
  });
  it('parses chained inverse block with block params', function() {
    equals(astFor('{{#foo}}{{else foo as |bar baz|}}content{{/foo}}'), "BLOCK:\n  PATH:foo []\n  PROGRAM:\n  {{^}}\n    BLOCK:\n      PATH:foo []\n      PROGRAM:\n        BLOCK PARAMS: [ bar baz ]\n        CONTENT[ 'content' ]\n");
  });
  it('raises if there\'s a Parse error', function() {
    shouldThrow(function() {
      astFor('foo{{^}}bar');
    }, Error, /Parse error on line 1/);
    shouldThrow(function() {
      astFor('{{foo}');
    }, Error, /Parse error on line 1/);
    shouldThrow(function() {
      astFor('{{foo &}}');
    }, Error, /Parse error on line 1/);
    shouldThrow(function() {
      astFor('{{#goodbyes}}{{/hellos}}');
    }, Error, /goodbyes doesn't match hellos/);

    shouldThrow(function() {
      astFor('{{{{goodbyes}}}} {{{{/hellos}}}}');
    }, Error, /goodbyes doesn't match hellos/);
  });

  it('should handle invalid paths', function() {
    shouldThrow(function() {
      astFor('{{foo/../bar}}');
    }, Error, /Invalid path: foo\/\.\. - 1:2/);
    shouldThrow(function() {
      astFor('{{foo/./bar}}');
    }, Error, /Invalid path: foo\/\. - 1:2/);
    shouldThrow(function() {
      astFor('{{foo/this/bar}}');
    }, Error, /Invalid path: foo\/this - 1:2/);
  });

  it('knows how to report the correct line number in errors', function() {
    shouldThrow(function() {
      astFor('hello\nmy\n{{foo}');
    }, Error, /Parse error on line 3/);
    shouldThrow(function() {
      astFor('hello\n\nmy\n\n{{foo}');
    }, Error, /Parse error on line 5/);
  });

  it('knows how to report the correct line number in errors when the first character is a newline', function() {
    shouldThrow(function() {
      astFor('\n\nhello\n\nmy\n\n{{foo}');
    }, Error, /Parse error on line 7/);
  });

  describe('externally compiled AST', function() {
    it('can pass through an already-compiled AST', function() {
      equals(astFor({
        type: 'Program',
        body: [ {type: 'ContentStatement', value: 'Hello'}]
      }), 'CONTENT[ \'Hello\' ]\n');
    });
  });

  describe('directives', function() {
    it('should parse block directives', function() {
      equals(astFor('{{#* foo}}{{/foo}}'), 'DIRECTIVE BLOCK:\n  PATH:foo []\n  PROGRAM:\n');
    });
    it('should parse directives', function() {
      equals(astFor('{{* foo}}'), '{{ DIRECTIVE PATH:foo [] }}\n');
    });
    it('should fail if directives have inverse', function() {
      shouldThrow(function() {
        astFor('{{#* foo}}{{^}}{{/foo}}');
      }, Error, /Unexpected inverse/);
    });
  });

  it('GH1024 - should track program location properly', function() {
    var p = Handlebars.parse('\n'
      + '  {{#if foo}}\n'
      + '    {{bar}}\n'
      + '       {{else}}    {{baz}}\n'
      + '\n'
      + '     {{/if}}\n'
      + '    ');

    // We really need a deep equals but for now this should be stable...
    equals(JSON.stringify(p.loc), JSON.stringify({
      start: { line: 1, column: 0 },
      end: { line: 7, column: 4 }
    }));
    equals(JSON.stringify(p.body[1].program.loc), JSON.stringify({
      start: { line: 2, column: 13 },
      end: { line: 4, column: 7 }
    }));
    equals(JSON.stringify(p.body[1].inverse.loc), JSON.stringify({
      start: { line: 4, column: 15 },
      end: { line: 6, column: 5 }
    }));
  });
});
