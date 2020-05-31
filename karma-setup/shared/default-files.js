module.exports = function files(...additionalFiles) {
  return [
    'node_modules/sinon/pkg/sinon.js',
    'node_modules/chai/chai.js',
    'node_modules/dirty-chai/lib/dirty-chai.js',
    'node_modules/mocha/mocha.js',
    ...additionalFiles,
    'spec/browser-setup/browser-context.js',
    'spec/browser-setup/mocha.js',
    'spec/vendor/json2.js',
    'spec/env/common.js'
  ];
};
