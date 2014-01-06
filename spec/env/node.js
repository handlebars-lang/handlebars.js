/*global handlebarsEnv */
require('./common');

global.Handlebars = require('../../lib');

global.CompilerContext = {
  compile: function(template, options) {
    var templateSpec = handlebarsEnv.precompile(template, options);
    return handlebarsEnv.template(safeEval(templateSpec));
  },
  compileWithPartial: function(template, options) {
    return handlebarsEnv.compile(template, options);
  }
};

function safeEval(templateSpec) {
  try {
    return eval('(' + templateSpec + ')');
  } catch (err) {
    console.error(templateSpec);
    throw err;
  }
}
