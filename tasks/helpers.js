var pathUtils = require('path'),
    grunt     = require('grunt'),
    _         = grunt.util._,
    helpers   = {};

helpers.config = {
  pkg: grunt.file.readJSON('./package.json'),
  env: process.env
};

helpers.loadConfig = function(path) {
  var glob = require('glob'),
      obj  = {},
      key;

  glob.sync('*', { cwd: path }).forEach(function(option) {
    key = option.replace(/\.js$/, '');
    obj[key] = require('../' + path + option);
  });

  return obj;
}

module.exports = helpers;
