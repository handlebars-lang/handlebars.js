require('./common');

global.Handlebars = require('../../dist/handlebars.runtime');

var compiler = require('../../lib/handlebars');

global.CompilerContext = {
  compile: function(template, options, env) {
    var templateSpec = compiler.precompile(template, options);
    return Handlebars.template(eval('(' + templateSpec + ')'), env);
  },
  compileWithPartial: function(template, options, env) {
    return compiler.compile(template, options);
  }
};
