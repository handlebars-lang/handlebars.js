var childProcess = require('child_process');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: [
        'dist/**/!(*.min|parser).js'
      ]
    },

    clean: ['tmp', 'dist', 'lib/handlebars/compiler/parser.js'],

    copy: {
      dist: {
        options: {
          processContent: function(content, path) {
            return grunt.template.process('/*!\n\n <%= pkg.name %> v<%= pkg.version %>\n\n<%= grunt.file.read("LICENSE") %>\n@license\n*/\n')
                + content;
          }
        },
        files: [
          {expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/'}
        ]
      },
      cdnjs: {
        files: [
          {expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/cdnjs'}
        ]
      },
      components: {
        files: [
          {expand: true, cwd: 'components/', src: ['**'], dest: 'dist/components'},
          {expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/components'}
        ]
      }
    },

    packager: {
      global: {
        type: 'global',
        export: 'Handlebars',
        files: [{
          cwd: 'lib/',
          expand: true,
          src: ['handlebars*.js'],
          dest: 'dist/'
        }]
      },

      amd: {
        type: 'amd',
        anonymous: true,
        files: [{
          expand: true,
          cwd: 'lib/',
          src: '**/!(index).js',
          dest: 'dist/amd/'
        }]
      },

      cjs: {
        type: 'cjs',
        files: [{
          expand: true,
          cwd: 'lib/',
          src: '**/!(index).js',
          dest: 'dist/cjs/'
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
    },

    concat: {
      tests: {
        src: ['spec/!(require).js'],
        dest: 'tmp/tests.js'
      }
    }
  });

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of the current project", [
                    'clean',
                    'parser',
                    'node',
                    'globals',
                    'jshint']);

  this.registerTask('amd', ['packager:amd', 'requirejs']);
  this.registerTask('node', ['packager:cjs']);
  this.registerTask('globals', ['packager:global']);
  this.registerTask('tests', ['concat:tests']);

  this.registerTask('release', 'Build final packages', ['amd', 'jshint', 'uglify', 'copy:dist', 'copy:components', 'copy:cdnjs']);

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('es6-module-packager');

  grunt.task.loadTasks('tasks');

  grunt.registerTask('bench', ['metrics']);

  grunt.registerTask('default', ['build', 'test', 'release']);
};
