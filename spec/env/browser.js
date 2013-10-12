require('./common');

var _ = require('underscore'),
    fs = require('fs'),
    vm = require('vm');

global.Handlebars = undefined;
vm.runInThisContext(fs.readFileSync(__dirname + '/../../dist/handlebars.js'), 'dist/handlebars.js');

global.CompilerContext = {
  compile: function(template, options) {
    var templateSpec = handlebarsEnv.precompile(template, options);
    return handlebarsEnv.template(eval('(' + templateSpec + ')'));
  },
  compileWithPartial: function(template, options) {
    return handlebarsEnv.compile(template, options);
  }
};
