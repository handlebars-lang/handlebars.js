describe('Visitor', function() {
  if (!Handlebars.Visitor || !Handlebars.print) {
    return;
  }

  it('should provide coverage', function() {
    // Simply run the thing and make sure it does not fail and that all of the
    // stub methods are executed
    var visitor = new Handlebars.Visitor();
    visitor.accept(Handlebars.parse('{{foo}}{{#foo (bar 1 "1" true undefined null) foo=@data}}{{!comment}}{{> bar }} {{/foo}}'));
    visitor.accept(Handlebars.parse('{{#> bar }} {{/bar}}'));
    visitor.accept(Handlebars.parse('{{#* bar }} {{/bar}}'));
    visitor.accept(Handlebars.parse('{{* bar }}'));
  });

  it('should traverse to stubs', function() {
    var visitor = new Handlebars.Visitor();

    visitor.StringLiteral = function(string) {
      equal(string.value, '2');
    };
    visitor.NumberLiteral = function(number) {
      equal(number.value, 1);
    };
    visitor.BooleanLiteral = function(bool) {
      equal(bool.value, true);

      equal(this.parents.length, 3);
      equal(this.parents[0].type, 'SubExpression');
      equal(this.parents[1].type, 'BlockStatement');
      equal(this.parents[2].type, 'Program');
    };
    visitor.PathExpression = function(id) {
      equal(/(foo\.)?bar$/.test(id.original), true);
    };
    visitor.ContentStatement = function(content) {
      equal(content.value, ' ');
    };
    visitor.CommentStatement = function(comment) {
      equal(comment.value, 'comment');
    };

    visitor.accept(Handlebars.parse('{{#foo.bar (foo.bar 1 "2" true) foo=@foo.bar}}{{!comment}}{{> bar }} {{/foo.bar}}'));
  });

  describe('mutating', function() {
    describe('fields', function() {
      it('should replace value', function() {
        var visitor = new Handlebars.Visitor();

        visitor.mutating = true;
        visitor.StringLiteral = function(string) {
          return {type: 'NumberLiteral', value: 42, loc: string.loc};
        };

        var ast = Handlebars.parse('{{foo foo="foo"}}');
        visitor.accept(ast);
        equals(Handlebars.print(ast), '{{ PATH:foo [] HASH{foo=NUMBER{42}} }}\n');
      });
      it('should treat undefined resonse as identity', function() {
        var visitor = new Handlebars.Visitor();
        visitor.mutating = true;

        var ast = Handlebars.parse('{{foo foo=42}}');
        visitor.accept(ast);
        equals(Handlebars.print(ast), '{{ PATH:foo [] HASH{foo=NUMBER{42}} }}\n');
      });
      it('should remove false responses', function() {
        var visitor = new Handlebars.Visitor();

        visitor.mutating = true;
        visitor.Hash = function() {
          return false;
        };

        var ast = Handlebars.parse('{{foo foo=42}}');
        visitor.accept(ast);
        equals(Handlebars.print(ast), '{{ PATH:foo [] }}\n');
      });
      it('should throw when removing required values', function() {
        shouldThrow(function() {
          var visitor = new Handlebars.Visitor();

          visitor.mutating = true;
          visitor.PathExpression = function() {
            return false;
          };

          var ast = Handlebars.parse('{{foo 42}}');
          visitor.accept(ast);
        }, Handlebars.Exception, 'MustacheStatement requires path');
      });
      it('should throw when returning non-node responses', function() {
        shouldThrow(function() {
          var visitor = new Handlebars.Visitor();

          visitor.mutating = true;
          visitor.PathExpression = function() {
            return {};
          };

          var ast = Handlebars.parse('{{foo 42}}');
          visitor.accept(ast);
        }, Handlebars.Exception, 'Unexpected node type "undefined" found when accepting path on MustacheStatement');
      });
    });
    describe('arrays', function() {
      it('should replace value', function() {
        var visitor = new Handlebars.Visitor();

        visitor.mutating = true;
        visitor.StringLiteral = function(string) {
          return {type: 'NumberLiteral', value: 42, loc: string.locInfo};
        };

        var ast = Handlebars.parse('{{foo "foo"}}');
        visitor.accept(ast);
        equals(Handlebars.print(ast), '{{ PATH:foo [NUMBER{42}] }}\n');
      });
      it('should treat undefined resonse as identity', function() {
        var visitor = new Handlebars.Visitor();
        visitor.mutating = true;

        var ast = Handlebars.parse('{{foo 42}}');
        visitor.accept(ast);
        equals(Handlebars.print(ast), '{{ PATH:foo [NUMBER{42}] }}\n');
      });
      it('should remove false responses', function() {
        var visitor = new Handlebars.Visitor();

        visitor.mutating = true;
        visitor.NumberLiteral = function() {
          return false;
        };

        var ast = Handlebars.parse('{{foo 42}}');
        visitor.accept(ast);
        equals(Handlebars.print(ast), '{{ PATH:foo [] }}\n');
      });
    });
  });
});
