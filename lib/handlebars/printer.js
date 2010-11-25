if(exports) { var Visitor = require("handlebars/jison_ext").Visitor }

PrintVisitor = function() { this.padding = 0; };
PrintVisitor.prototype = new Visitor;

PrintVisitor.prototype.pad = function(string, newline) {
  var out = "";

  for(var i=0,l=this.padding; i<l; i++) {
    out = out + "  ";
  }

  out = out + string;

  if(newline !== false) { out = out + "\n" }
  return out;
};

PrintVisitor.prototype.program = function(program) {
  var out = this.pad("PROGRAM:"),
      statements = program.statements,
      inverse = program.inverse;

  this.padding++;

  for(var i=0, l=statements.length; i<l; i++) {
    out = out + this.accept(statements[i]);
  }

  this.padding--;

  if(inverse) {
    out = out + this.pad("{{^}}");

    this.padding++;

    for(var i=0, l=inverse.length; i<l; i++) {
      out = out + this.accept(inverse[i]);
    }
  }

  this.padding--;

  return out;
};

PrintVisitor.prototype.block = function(block) {
  var out = "";

  out = out + this.pad("BLOCK:");
  this.padding++;
  out = out + this.accept(block.mustache);
  out = out + this.accept(block.program);
  this.padding--;

  return out;
};

PrintVisitor.prototype.mustache = function(mustache) {
  var params = mustache.params, paramStrings = [];

  for(var i=0, l=params.length; i<l; i++) {
    paramStrings.push(this.accept(params[i]));
  }

  var params = "[" + paramStrings.join(", ") + "]";
  return this.pad("{{ " + this.accept(mustache.id) + " " + params + "}}");
};

PrintVisitor.prototype.partial = function(partial) {
  return this.pad("{{> " + this.accept(partial.id) + " }}");
};

PrintVisitor.prototype.STRING = function(string) {
  return string.string;
};

PrintVisitor.prototype.ID = function(id) {
  return "ID:" + id.id;
};

PrintVisitor.prototype.content = function(content) {
  return this.pad("CONTENT[ '" + content.string + "' ]");
};

PrintVisitor.prototype.comment = function(comment) {
  return this.pad("{{! '" + comment.comment + "' }}");
}

if(exports) {
  exports.PrintVisitor = PrintVisitor;
}
