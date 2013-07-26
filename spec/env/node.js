require('./common');

global.Handlebars = require('../../zomg/lib/handlebars');

global.CompilerContext = {
  compile: function(template, options, env) {
    env = env || handlebarsEnv;
    var templateSpec = Handlebars.precompile(template, options);
    return Handlebars.template(eval('(' + templateSpec + ')'), env);
  },
  compileWithPartial: function(template, options) {
    options = options || {};
    options.env = handlebarsEnv;
    return Handlebars.compile(template, options);
  }
};
