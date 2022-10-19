require('./common');

var chai = require('chai');
var dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
global.expect = chai.expect;

global.sinon = require('sinon');

global.Handlebars = require('../../lib');

global.CompilerContext = {
  compile: function (template, options) {
    var templateSpec = handlebarsEnv.precompile(template, options);
    return handlebarsEnv.template(safeEval(templateSpec));
  },
  compileWithPartial: function (template, options) {
    return handlebarsEnv.compile(template, options);
  },
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
