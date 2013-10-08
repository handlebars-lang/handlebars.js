module.exports = function(grunt) {
  var helpers = require('./tasks/helpers'),
      config  = helpers.config,
      _       = grunt.util._;

  config = _.extend(config, helpers.loadConfig('tasks/options/'));
  grunt.initConfig(config);

  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('tasks');

  grunt.registerTask('build', ['transpile', 'jshint', 'copy:stage', 'concat']);
  //grunt.registerTask('build', 'Builds a distributable version of the current project', [
                     //'jshint',
                     //'clean',
                     //'parser',
                     //'transpile',
                     //'concat',
                     //'concat',
                     //'uglify']);

  grunt.registerTask('tests', 'Run QUnit tests using node', ['mocha_phantomjs', 'mochaTest']);

  grunt.registerTask('bench', ['metrics']);

  grunt.registerTask('server', 'Run server', [
                     'clean:build', 'build', 'connect:server', 'watch:tests'
                    ]);
};
