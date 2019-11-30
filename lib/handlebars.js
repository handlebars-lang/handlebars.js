import runtime from './handlebars.runtime';

// Compiler imports
import AST from './handlebars/compiler/ast';
import { parser as Parser, parse, parseWithoutProcessing } from './handlebars/compiler/base';
import { Compiler, compile, precompile } from './handlebars/compiler/compiler';
import JavaScriptCompiler from './handlebars/compiler/javascript-compiler';
import Visitor from './handlebars/compiler/visitor';

import noConflict from './handlebars/no-conflict';

function create() {
  let hb = runtime.create();
  hb.create = create;
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
  hb.parseWithoutProcessing = parseWithoutProcessing;

  return hb;
}

let inst = create();
noConflict(inst);

inst.Visitor = Visitor;

inst['default'] = inst;

export default inst;
