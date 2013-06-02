require('./common');

global.Handlebars = require('../../dist/handlebars.runtime');

var compiler = require('../../lib/handlebars');

global.CompilerContext = {
  compile: function(template, options) {
    var templateSpec = compiler.precompile(template, options);
    return Handlebars.template(eval('(' + templateSpec + ')'));
  },
  compileWithPartial: function(template, options) {
    return compiler.compile(template, options);
  }
};
