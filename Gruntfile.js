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
        'lib/**/!(parser).js'
      ]
    },

    clean: ["dist"],
    watch: config('watch') ,
    concat: config('concat'),
    connect: config('connect'),
    transpile: config('transpile'),

    packager: {
      options: {
        export: 'Handlebars'
      },

      global: {
        files: [{
          cwd: 'lib/',
          expand: true,
          src: ['handlebars*.js'],
          dest: 'dist/'
        }]
      }
    },
    requirejs: {
      options: {
        optimize: "none",
        baseUrl: "dist/amd/"
      },
      dist: {
        options: {
          name: "handlebars",
          out: "dist/handlebars.amd.js"
        }
      },
      runtime: {
        options: {
          name: "handlebars.runtime",
          out: "dist/handlebars.runtime.amd.js"
        }
      }
    },

    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: 'some'
      },
      dist: {
        files: [{
          cwd: 'dist/',
          expand: true,
          src: ['handlebars*.js'],
          dest: 'dist/',
          rename: function(dest, src) {
            return dest + src.replace(/\.js$/, '.min.js');
          }
        }]
      }
    }
  });

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of the current project", [
                    'jshint',
                    'clean',
                    'parser',
                    'transpile:amd',
                    'transpile:cjs',
                    'packager-fork']);

  this.registerTask('release', 'Build final packages', [
                    'requirejs',
                    'uglify'
                    ]);

  grunt.registerTask('packager-fork', function() {
    // Allows us to run the packager task out of process to work around the multiple
    // traceur exec issues
    grunt.util.spawn({grunt: true,  args: ['packager']}, this.async());
  });

  // Run a server. This is ideal for running the QUnit tests in the browser.
  this.registerTask('server', [
                    'build',
                    'tests',
                    'connect',
                    'watch']);

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
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

  grunt.registerTask('default', ['build', 'test', 'release']);
};
