require('./common');

var fs = require('fs'),
    vm = require('vm');

global.Handlebars = 'no-conflict';

var filename = 'dist/handlebars.js';
if (global.minimizedTest) {
  filename = 'dist/handlebars.min.js';
}
var distHandlebars = fs.readFileSync(require.resolve(`../../${filename}`), 'utf-8');
vm.runInThisContext(distHandlebars, filename);

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
