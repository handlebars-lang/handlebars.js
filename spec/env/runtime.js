require('./common');

var fs = require('fs'),
    vm = require('vm');

global.Handlebars = 'no-conflict';
vm.runInThisContext(fs.readFileSync(__dirname + '/../../dist/handlebars.runtime.js'), 'dist/handlebars.runtime.js');

var parse = require('../../dist/cjs/handlebars/compiler/base').parse;
var compiler = require('../../dist/cjs/handlebars/compiler/compiler');
var JavaScriptCompiler = require('../../dist/cjs/handlebars/compiler/javascript-compiler');

global.CompilerContext = {
  browser: true,

  compile: function(template, options) {
    // Hack the compiler on to the environment for these specific tests
    handlebarsEnv.precompile = function(precompileTemplate, precompileOptions) {
      return compiler.precompile(precompileTemplate, precompileOptions, handlebarsEnv);
    };
    handlebarsEnv.parse = parse;
    handlebarsEnv.Compiler = compiler.Compiler;
    handlebarsEnv.JavaScriptCompiler = JavaScriptCompiler;

    var templateSpec = handlebarsEnv.precompile(template, options);
    return handlebarsEnv.template(safeEval(templateSpec));
  },
  compileWithPartial: function(template, options) {
    // Hack the compiler on to the environment for these specific tests
    handlebarsEnv.compile = function(compileTemplate, compileOptions) {
      return compiler.compile(compileTemplate, compileOptions, handlebarsEnv);
    };
    handlebarsEnv.parse = parse;
    handlebarsEnv.Compiler = compiler.Compiler;
    handlebarsEnv.JavaScriptCompiler = JavaScriptCompiler;

    return handlebarsEnv.compile(template, options);
  }
};

function safeEval(templateSpec) {
  /* eslint-disable no-eval, no-console */
  try {
    return eval('(' + templateSpec + ')');
  } catch (err) {
    console.error(templateSpec);
    throw err;
  }
  /* eslint-enable no-eval, no-console */
}
