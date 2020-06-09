module.exports = function(config) {
  config.set({
    basePath: '../..',
    reporters: ['dots'],
    frameworks: ['mocha'],
    browsers: ['Chrome'],
    files: [
      'node_modules/sinon/pkg/sinon.js',
      'node_modules/chai/chai.js',
      'node_modules/dirty-chai/lib/dirty-chai.js',
      'karma-setup/shared/*.browser.js',
      'karma-setup/default/*.browser.js',
      'spec/vendor/json2.js',
      'spec/env/common.js',

      'dist/handlebars.js',
      'spec/*.js'
    ]
  });
};
