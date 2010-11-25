var ProgramNode = function(statements, inverse) {
  this.type = "program";
  this.statements = statements;
  this.inverse = inverse;
};

var MustacheNode = function(params) {
  this.type = "mustache";
  this.id = params[0];
  this.params = params.slice(1);
};

var PartialNode = function(id) {
  this.type = "partial";
  this.id = id;
};

var BlockNode = function(mustache, program) {
  this.type = "block";
  this.mustache = mustache;
  this.program  = program;
};

var ContentNode = function(string) {
  this.type = "content";
  this.string = string;
}

var IdNode = function(id) {
  this.type = "ID"
  this.id = id;
}

StringNode = function(string) {
  this.type = "STRING";
  this.string = string;
}

CommentNode = function(comment) {
  this.type = "comment";
  this.comment = comment;
}

if(exports) {
  exports.ProgramNode  = ProgramNode;
  exports.MustacheNode = MustacheNode;
  exports.ContentNode  = ContentNode;
  exports.IdNode       = IdNode;
  exports.StringNode   = StringNode;
  exports.PartialNode  = PartialNode;
  exports.CommentNode  = CommentNode;
  exports.BlockNode    = BlockNode;
}
