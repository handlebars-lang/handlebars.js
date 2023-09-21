import './common.js';

import chai from 'chai';
import dirtyChai from 'dirty-chai';
import sinon from 'sinon';

import Handlebars from '../../lib/index.js';

chai.use(dirtyChai);
global.expect = chai.expect;

global.sinon = sinon;

global.Handlebars = Handlebars;

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
  /* eslint-disable no-eval, no-console */
  try {
    return eval('(' + templateSpec + ')');
  } catch (err) {
    console.error(templateSpec);
    throw err;
  }
  /* eslint-enable no-eval, no-console */
}
