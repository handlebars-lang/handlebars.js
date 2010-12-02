if(exports) { var Handlebars = {} }

Handlebars.AST = {};

Handlebars.AST.ProgramNode = function(statements, inverse) {
  this.type = "program";
  this.statements = statements;
  this.inverse = inverse;
};

Handlebars.AST.MustacheNode = function(params, unescaped) {
  this.type = "mustache";
  this.id = params[0];
  this.params = params.slice(1);
  this.escaped = !unescaped;
};

Handlebars.AST.PartialNode = function(id, context) {
  this.type    = "partial";
  this.id      = id;
  this.context = context;
};

Handlebars.AST.BlockNode = function(mustache, program) {
  this.type = "block";
  this.mustache = mustache;
  this.program  = program;
};

Handlebars.AST.ContentNode = function(string) {
  this.type = "content";
  this.string = string;
}

Handlebars.AST.IdNode = function(parts) {
  this.type = "ID"

  var dig = [], depth = 0;

  for(var i=0,l=parts.length; i<l; i++) {
    var part = parts[i];

    if(part === "..") { depth++; }
    else if(part === "." || part === "this") { continue; }
    else { dig.push(part) }
  }

  this.parts = dig;
  this.depth = depth;
}

Handlebars.AST.StringNode = function(string) {
  this.type = "STRING";
  this.string = string;
}

Handlebars.AST.CommentNode = function(comment) {
  this.type = "comment";
  this.comment = comment;
}

if(exports) {
  exports.AST = Handlebars.AST;
}
