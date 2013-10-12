var _ = require('underscore'),
    templates = require('./templates');

module.exports = function(grunt, callback) {
  // Deferring to here in case we have a build for parser, etc as part of this grunt exec
  var Handlebars = require('../lib');

  var templateSizes = {};
  _.each(templates, function(info, template) {
    var src = info.handlebars,
        compiled = Handlebars.precompile(src, {}),
        knownHelpers = Handlebars.precompile(src, {knownHelpersOnly: true, knownHelpers: info.helpers});

    templateSizes[template] = compiled.length;
    templateSizes['knownOnly_' + template] = knownHelpers.length;
  });
  grunt.log.writeln('Precompiled sizes: ' + JSON.stringify(templateSizes, undefined, 2));
  callback([templateSizes]);
};
