var childProcess = require('child_process');

function config(name) {
  return require('./configurations/' + name);
}

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: true
      },
      files: [
        'lib/**/!(parser|browser-prefix|browser-suffix).js'
      ]
    },

    clean: ["dist"],
    watch: config('watch') ,
    concat: config('concat'),
    connect: config('connect'),
    transpile: config('transpile'),

    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: 'some'
      },
      dist: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      },
      runtime: {
        src: 'dist/<%= pkg.name %>.runtime.js',
        dest: 'dist/<%= pkg.name %>.runtime.min.js'
      }
    }
  });

  // By default, (i.e., if you invoke `grunt` without arguments), do
  // a new build.
  this.registerTask('default', ['build']);

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of the current project", [
                    'clean',
                    'transpile:amd',
                    'concat:library']);

  this.registerTask('tests', "Builds the test package", [
                    'build',
                    'concat:deps',
                    'transpile:tests']);

  // Run a server. This is ideal for running the QUnit tests in the browser.
  this.registerTask('server', [
                    'build',
                    'tests',
                    'connect',
                    'watch']);

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');

  grunt.task.loadTasks('tasks');

  grunt.registerTask('test', function() {
    var done = this.async();

    var runner = childProcess.fork('./spec/env/runner', [], {stdio: 'inherit'});
    runner.on('close', function(code) {
      if (code != 0) {
        grunt.fatal(code + ' tests failed');
      }
      done();
    });
  });
  grunt.registerTask('bench', ['metrics']);

  grunt.registerTask('build', ['jshint', 'parser', 'clean', 'concat', 'uglify', 'test']);
  grunt.registerTask('default', 'build');
};
