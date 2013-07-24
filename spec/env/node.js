require('./common');

global.Handlebars = require('../../zomg/lib/handlebars');

global.CompilerContext = {
  compile: function(template, options) {
    var templateSpec = Handlebars.precompile(template, options);
    console.log(templateSpec);
    return Handlebars.template(eval('(' + templateSpec + ')'));
  },
  compileWithPartial: function(template, options) {
    return Handlebars.compile(template, options);
  }
};
