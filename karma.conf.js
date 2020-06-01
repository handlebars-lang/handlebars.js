module.exports = function(config) {
  config.set({
    reporters: ['dots'],
    frameworks: ['mocha', 'requirejs'],
    browsers: ['Chrome'],
    files: [
      { pattern: 'node_modules/sinon/pkg/sinon.js', included: false },
      { pattern: 'node_modules/chai/chai.js', included: false },
      { pattern: 'node_modules/dirty-chai/lib/dirty-chai.js', included: false },
      { pattern: 'dist/handlebars.amd.js', included: false },
      'karma-setup/karma-includes/browser-context.js',
      'spec/vendor/json2.js',
      'spec/env/common.js',
      'karma-setup/karma-includes/require-config.js',
      { pattern: 'spec/*.js', included: false }
    ]
  });
};
