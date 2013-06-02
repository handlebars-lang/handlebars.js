require('./common');

global.Handlebars = require('../../dist/handlebars');

global.CompilerContext = {
  compile: function(template, options) {
    var templateSpec = Handlebars.precompile(template, options);
    return Handlebars.template(eval('(' + templateSpec + ')'));
  },
  compileWithPartial: function(template, options) {
    return Handlebars.compile(template, options);
  }
};
