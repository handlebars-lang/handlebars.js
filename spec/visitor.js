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
    visitor.accept(Handlebars.parse('{{#foo (bar 1 "1" true) foo=@data}}{{!comment}}{{> bar }} {{/foo}}'));
  });

  it('should traverse to stubs', function() {
    var visitor = new Handlebars.Visitor();

    visitor.PARTIAL_NAME = function(partialName) {
      equal(partialName.name, 'bar');
    };

    visitor.STRING = function(string) {
      equal(string.string, '2');
    };
    visitor.NUMBER = function(number) {
      equal(number.stringModeValue, 1);
    };
    visitor.BOOLEAN = function(bool) {
      equal(bool.stringModeValue, true);
    };
    visitor.ID = function(id) {
      equal(id.original, 'foo.bar');
    };
    visitor.content = function(content) {
      equal(content.string, ' ');
    };
    visitor.comment = function(comment) {
      equal(comment.comment, 'comment');
    };

    visitor.accept(Handlebars.parse('{{#foo.bar (foo.bar 1 "2" true) foo=@foo.bar}}{{!comment}}{{> bar }} {{/foo.bar}}'));
  });
});
