module.exports = function(config) {
  config.set({
    ...require('../shared/default-config'),
    ...require('../shared/saucelabs'),
    files: [
      '../../node_modules/sinon/pkg/sinon.js',
      '../../node_modules/chai/chai.js',
      '../../node_modules/dirty-chai/lib/dirty-chai.js',
      '../../node_modules/mocha/mocha.js',
      '../../spec/karma-includes/browser-context.js',
      '../../spec/karma-includes/mocha.js',
      '../../spec/vendor/json2.js',
      '../../spec/env/common.js',
      { pattern: '../../spec/*.js', included: false }
    ]
  });
};
