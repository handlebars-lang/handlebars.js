import './common.js';
import Handlebars from '../../lib/handlebars.js';

globalThis.Handlebars = Handlebars;

globalThis.CompilerContext = {
  browser: true,

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
