import Handlebars from './handlebars.runtime';

// Compiler imports
import AST from './handlebars/compiler/ast';
import { parser as Parser, parse } from './handlebars/compiler/base';
import { Compiler, compile, precompile } from './handlebars/compiler/compiler';
import JavaScriptCompiler from './handlebars/compiler/javascript-compiler';
import Visitor from './handlebars/compiler/visitor';

var _create = Handlebars.create;
function create() {
  var hb = _create();

  hb.compile = function(input, options) {
    return compile(input, options, hb);
  };
  hb.precompile = function(input, options) {
    return precompile(input, options, hb);
  };

  hb.AST = AST;
  hb.Compiler = Compiler;
  hb.JavaScriptCompiler = JavaScriptCompiler;
  hb.Parser = Parser;
  hb.parse = parse;

  return hb;
}

var inst = create();
inst.create = create;

inst.Visitor = Visitor;

/*jshint -W040 */
/* istanbul ignore next */
var $Handlebars = global.Handlebars;
/* istanbul ignore next */
inst.noConflict = function() {
  if (global.Handlebars === inst) {
    global.Handlebars = $Handlebars;
  }
};

inst['default'] = inst;

export default inst;
