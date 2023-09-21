import * as parser from '@handlebars/parser';

const { parse, parseWithoutProcessing } = parser;

const Parser = parser.parser ?? parser.default.parser;
const Visitor = parser.Visitor ?? parser.default.Visitor;

import runtime from './index.runtime.js';

// Compiler imports
import AST from './compiler/ast.js';
import { Compiler, compile, precompile } from './compiler/compiler.js';
import JavaScriptCompiler from './compiler/javascript-compiler.js';

import noConflict from './no-conflict.js';

let _create = runtime.create;
function create() {
  let hb = _create();

  hb.compile = function (input, options) {
    return compile(input, options, hb);
  };
  hb.precompile = function (input, options) {
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
inst.create = create;

noConflict(inst);

inst.Visitor = Visitor;

inst['default'] = inst;

export default inst;
