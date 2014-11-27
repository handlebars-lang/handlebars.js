/*global Handlebars */

describe('Visitor', function() {
  if (!Handlebars.Visitor) {
    return;
  }

  function ast_for(template) {
    var ast = Handlebars.parse(template);
    return Handlebars.print(ast);
  }

  it('should provide coverage', function() {
    // Simply run the thing and make sure it does not fail and that all of the
    // stub methods are executed
    var visitor = new Handlebars.Visitor();
    visitor.accept(Handlebars.parse('{{foo}}{{#foo (bar 1 "1" true) foo=@data}}{{!comment}}{{> bar }} {{/foo}}'));
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
    };
    visitor.PathExpression = function(id) {
      equal(/foo\.bar$/.test(id.original), true);
    };
    visitor.ContentStatement = function(content) {
      equal(content.value, ' ');
    };
    visitor.CommentStatement = function(comment) {
      equal(comment.value, 'comment');
    };

    visitor.accept(Handlebars.parse('{{#foo.bar (foo.bar 1 "2" true) foo=@foo.bar}}{{!comment}}{{> bar }} {{/foo.bar}}'));
  });
});
