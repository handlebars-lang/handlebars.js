const files = require('../shared/default-files');

module.exports = function(config) {
  config.set({
    ...require('../shared/default-config'),
    files: [...files('dist/handlebars.js'), 'spec/*.js']
  });
};
