function Visitor() {}

Visitor.prototype = {
  constructor: Visitor,

  accept: function(object) {
    return object && this[object.type](object);
  },

  Program: function(program) {
    var body = program.body,
        i, l;

    for(i=0, l=body.length; i<l; i++) {
      this.accept(body[i]);
    }
  },

  MustacheStatement: function(mustache) {
    this.accept(mustache.sexpr);
  },

  BlockStatement: function(block) {
    this.accept(block.sexpr);
    this.accept(block.program);
    this.accept(block.inverse);
  },

  PartialStatement: function(partial) {
    this.accept(partial.partialName);
    this.accept(partial.context);
    this.accept(partial.hash);
  },

  ContentStatement: function(content) {},
  CommentStatement: function(comment) {},

  sexpr: function(sexpr) {
    var params = sexpr.params, paramStrings = [], hash;

    this.accept(sexpr.id);
    for(var i=0, l=params.length; i<l; i++) {
      this.accept(params[i]);
    }
    this.accept(sexpr.hash);
  },

  PathExpression: function(id) {},

  hash: function(hash) {
    var pairs = hash.pairs;

    for(var i=0, l=pairs.length; i<l; i++) {
      this.accept(pairs[i][1]);
    }
  },

  StringLiteral: function(string) {},
  NumberLiteral: function(number) {},
  BooleanLiteral: function(bool) {}
};

export default Visitor;
