/* global requirejs */

var tests = [];

console.log('ABC', Object.keys(window.__karma__.files));
requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/',

  paths: {
    handlebars: '/base/dist/handlebars.amd',
    mochaConfig: '/base/karma-setup/karma-includes/mocha',
    sinon: '/base/node_modules/sinon/pkg/sinon',
    chai: '/base/node_modules/chai/chai',
    dirtyChai: '/base/node_modules/dirty-chai/lib/dirty-chai'
  },

  shim: {
    mochaConfig: {
      deps: ['mocha', 'chai', 'dirtyChai', 'sinon']
    }
  },

  // ask Require.js to load these files (all our tests)
  deps: ['handlebars', 'mochaConfig', tests],

  // start test run, once Require.js is done
  callback: window.__karma__.start
});
