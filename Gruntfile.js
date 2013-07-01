function config(name) {
  return require('./configurations/' + name);
}

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ["dist"],
    watch: config('watch') ,
    concat: config('concat'),
    browser: config('browser'),
    connect: config('connect'),
    transpile: config('transpile')
  });

  // By default, (i.e., if you invoke `grunt` without arguments), do
  // a new build.
  this.registerTask('default', ['build']);

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of the current project", [
                    'clean',
                    'transpile:amd',
                    'concat:library',
                    'concat:browser',
                    'browser:dist',
                    'bytes']);

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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');

  grunt.task.loadTasks('tasks');
};
