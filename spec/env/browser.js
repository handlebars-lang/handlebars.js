require('./common');

var fs = require('fs'),
    vm = require('vm');

global.Handlebars = 'no-conflict';
vm.runInThisContext(fs.readFileSync(__dirname + '/../../dist/handlebars.js'), 'dist/handlebars.js');

global.CompilerContext = {
  browser: true,

  compile: function(template, options) {
    var templateSpec = handlebarsEnv.precompile(template, options);
    return handlebarsEnv.template(safeEval(templateSpec));
  },
  compileWithPartial: function(template, options) {
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
