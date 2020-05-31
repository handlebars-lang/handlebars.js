/* global requirejs */

var tests = [];

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base/src',

  paths: {
    handlebars: '/dist/handlebars.amd',
    tests: '/tmp/tests'
  },

  shim: {},

  // ask Require.js to load these files (all our tests)
  deps: ['handlebars', tests],

  // start test run, once Require.js is done
  callback: window.__karma__.start
});
