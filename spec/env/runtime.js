/*global handlebarsEnv */
require('./common');

var _ = require('underscore'),
    fs = require('fs'),
    vm = require('vm');

global.Handlebars = undefined;
vm.runInThisContext(fs.readFileSync(__dirname + '/../../dist/handlebars.runtime.js'), 'dist/handlebars.runtime.js');

var parse = require('../../dist/cjs/handlebars/compiler/base').parse;
var compiler = require('../../dist/cjs/handlebars/compiler/compiler');
var JavaScriptCompiler = require('../../dist/cjs/handlebars/compiler/javascript-compiler')['default'];

global.CompilerContext = {
  compile: function(template, options) {
    // Hack the compiler on to the environment for these specific tests
    handlebarsEnv.precompile = function(template, options) {
      return compiler.precompile(template, options, handlebarsEnv);
    };
    handlebarsEnv.parse = parse;
    handlebarsEnv.Compiler = compiler.Compiler;
    handlebarsEnv.JavaScriptCompiler = JavaScriptCompiler;

    var templateSpec = handlebarsEnv.precompile(template, options);
    return handlebarsEnv.template(safeEval(templateSpec));
  },
  compileWithPartial: function(template, options) {
    // Hack the compiler on to the environment for these specific tests
    handlebarsEnv.compile = function(template, options) {
      return compiler.compile(template, options, handlebarsEnv);
    };
    handlebarsEnv.parse = parse;
    handlebarsEnv.Compiler = compiler.Compiler;
    handlebarsEnv.JavaScriptCompiler = JavaScriptCompiler;

    return handlebarsEnv.compile(template, options);
  }
};

function safeEval(templateSpec) {
  return eval('(' + templateSpec + ')');
}
