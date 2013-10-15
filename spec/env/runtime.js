/*global handlebarsEnv */
require('./common');

var _ = require('underscore'),
    fs = require('fs'),
    vm = require('vm');

global.Handlebars = undefined;
vm.runInThisContext(fs.readFileSync(__dirname + '/../../dist/handlebars.runtime.js'), 'dist/handlebars.runtime.js');

var compiler = require('../../dist/cjs/handlebars/compiler/compiler');

global.CompilerContext = {
  compile: function(template, options) {
    var templateSpec = compiler.precompile(template, options);
    return handlebarsEnv.template(safeEval(templateSpec));
  },
  compileWithPartial: function(template, options) {
    // Hack the compiler on to the environment for these specific tests
    handlebarsEnv.compile = function(template, options) {
      return compiler.compile(template, options, handlebarsEnv);
    };
    return handlebarsEnv.compile(template, options);
  }
};

function safeEval(templateSpec) {
  return eval('(' + templateSpec + ')');
}
