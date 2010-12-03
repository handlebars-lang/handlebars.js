if(exports) {
  var Handlebars = {};
  Handlebars.Visitor = require("handlebars/jison_ext").Visitor
}

Handlebars.PrintVisitor = function() { this.padding = 0; };
Handlebars.PrintVisitor.prototype = new Handlebars.Visitor;

Handlebars.PrintVisitor.prototype.pad = function(string, newline) {
  var out = "";

  for(var i=0,l=this.padding; i<l; i++) {
    out = out + "  ";
  }

  out = out + string;

  if(newline !== false) { out = out + "\n" }
  return out;
};

Handlebars.PrintVisitor.prototype.program = function(program) {
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

Handlebars.PrintVisitor.prototype.block = function(block) {
  var out = "";

  out = out + (block.inverted ? this.pad("INVERSE:") : this.pad("BLOCK:"));
  this.padding++;
  out = out + this.accept(block.mustache);
  out = out + this.accept(block.program);
  this.padding--;

  return out;
};

Handlebars.PrintVisitor.prototype.mustache = function(mustache) {
  var params = mustache.params, paramStrings = [];

  for(var i=0, l=params.length; i<l; i++) {
    paramStrings.push(this.accept(params[i]));
  }

  var params = "[" + paramStrings.join(", ") + "]";
  return this.pad("{{ " + this.accept(mustache.id) + " " + params + " }}");
};

Handlebars.PrintVisitor.prototype.partial = function(partial) {
  var content = this.accept(partial.id);
  if(partial.context) { content = content + " " + this.accept(partial.context); }
  return this.pad("{{> " + content + " }}");
};

Handlebars.PrintVisitor.prototype.STRING = function(string) {
  return '"' + string.string + '"';
};

Handlebars.PrintVisitor.prototype.ID = function(id) {
  var path = id.parts.join("/");
  if(id.parts.length > 1) {
    return "PATH:" + path;
  } else {
    return "ID:" + path;
  }
};

Handlebars.PrintVisitor.prototype.content = function(content) {
  return this.pad("CONTENT[ '" + content.string + "' ]");
};

Handlebars.PrintVisitor.prototype.comment = function(comment) {
  return this.pad("{{! '" + comment.comment + "' }}");
}

if(exports) {
  exports.PrintVisitor = Handlebars.PrintVisitor;
}
