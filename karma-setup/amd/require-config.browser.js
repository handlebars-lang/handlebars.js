/* global requirejs */

var tests = Object.keys(window.__karma__.files).filter(function(file) {
  return file.match(/^\/base\/spec\/[^/]*\.js/);
});

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base',

  paths: {
    handlebars: 'dist/handlebars.amd',
    sinon: 'node_modules/sinon/pkg/sinon',
    chai: 'node_modules/chai/chai',
    dirtyChai: 'node_modules/dirty-chai/lib/dirty-chai'
  },

  // start test run, once Require.js is done
  callback: function() {
    require(['handlebars', 'chai', 'dirtyChai', 'sinon'], function(
      Handlebars,
      chai,
      dirtyChai,
      sinon
    ) {
      window.Handlebars = Handlebars;

      chai.use(dirtyChai);
      window.expect = chai.expect;

      window.sinon = sinon;

      require(tests, function() {
        window.__karma__.start();
      });
    });
  }
});
