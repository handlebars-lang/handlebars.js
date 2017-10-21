/* eslint-disable no-process-env */
const path = require('path');

module.exports = function(grunt) {

  function babelPreset(modules) {
    return [[
      'env',
      {
        loose: true,
        modules: modules
      }
    ]];
  }


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      options: {
      },
      files: [
        '*.js',
        'bench/**/*.js',
        'tasks/**/*.js',
        'lib/**/!(*.min|parser).js',
        'spec/**/!(*.amd|json2|require).js'
      ]
    },

    clean: ['tmp', 'dist', 'lib/handlebars/compiler/parser.js'],

    copy: {
      dist: {
        options: {
          processContent: function(content) {
            return grunt.template.process('/**!\n\n @license\n <%= pkg.name %> v<%= pkg.version %>\n\n<%= grunt.file.read("LICENSE") %>\n*/\n')
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

    babel: {
      options: {
        sourceMaps: 'inline',
        auxiliaryCommentBefore: 'istanbul ignore next'
      },
      amd: {
        options: {
          presets: babelPreset('amd')
        },
        files: [{
          expand: true,
          cwd: 'lib/',
          src: '**/!(index).js',
          dest: 'dist/amd/'
        }]
      },

      cjs: {
        options: {
          presets: babelPreset('commonjs')
        },
        files: [{
          cwd: 'lib/',
          expand: true,
          src: '**/!(index).js',
          dest: 'dist/cjs/'
        }]
      }
    },
    webpack: {
      options: {
        context: __dirname,
        module: {
          loaders: [
            // the optional 'runtime' transformer tells babel to require the runtime instead of inlining it.
            { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?optional=runtime&loose=es6.modules&auxiliaryCommentBefore=istanbul%20ignore%20next' }
          ]
        },
        output: {
          path: path.resolve(__dirname, 'dist'),
          library: 'Handlebars',
          libraryTarget: 'umd'
        }
      },
      handlebars: {
        entry: './lib/handlebars.js',
        output: {
          filename: 'handlebars.js'
        }
      },
      runtime: {
        entry: './lib/handlebars.runtime.js',
        output: {
          filename: 'handlebars.runtime.js'
        }
      }
    },

    requirejs: {
      options: {
        optimize: 'none',
        baseUrl: 'dist/amd/'
      },
      dist: {
        options: {
          name: 'handlebars',
          out: 'dist/handlebars.amd.js'
        }
      },
      runtime: {
        options: {
          name: 'handlebars.runtime',
          out: 'dist/handlebars.runtime.amd.js'
        }
      }
    },

    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: /(?:^!|@(?:license|preserve|cc_on))/
      },
      dist: {
        files: [{
          cwd: 'dist/',
          expand: true,
          src: ['handlebars*.js', '!*.min.js'],
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
    },

    connect: {
      server: {
        options: {
          base: '.',
          hostname: '*',
          port: 9999
        }
      }
    },
    'saucelabs-mocha': {
      all: {
        options: {
          build: process.env.TRAVIS_JOB_ID,
          urls: ['http://localhost:9999/spec/?headless=true', 'http://localhost:9999/spec/amd.html?headless=true'],
          detailedError: true,
          concurrency: 4,
          browsers: [
            {browserName: 'chrome'},
            {browserName: 'firefox', platform: 'Linux'},
            {browserName: 'safari', version: 9, platform: 'OS X 10.11'},
            {browserName: 'safari', version: 8, platform: 'OS X 10.10'},
            {browserName: 'internet explorer', version: 11, platform: 'Windows 8.1'},
            {browserName: 'internet explorer', version: 10, platform: 'Windows 8'}
          ]
        }
      },
      sanity: {
        options: {
          build: process.env.TRAVIS_JOB_ID,
          urls: ['http://localhost:9999/spec/umd.html?headless=true', 'http://localhost:9999/spec/amd-runtime.html?headless=true', 'http://localhost:9999/spec/umd-runtime.html?headless=true'],
          detailedError: true,
          concurrency: 2,
          browsers: [
            {browserName: 'chrome'}
          ]
        }
      }
    },

    watch: {
      scripts: {
        options: {
          atBegin: true
        },

        files: ['src/*', 'lib/**/*.js', 'spec/**/*.js'],
        tasks: ['build', 'amd', 'tests', 'test']
      }
    }
  });

  // Build a new version of the library
  this.registerTask('build', 'Builds a distributable version of the current project', [
                    'eslint',
                    'parser',
                    'node',
                    'globals']);

  this.registerTask('amd', ['babel:amd', 'requirejs']);
  this.registerTask('node', ['babel:cjs']);
  this.registerTask('globals', ['webpack']);
  this.registerTask('tests', ['concat:tests']);

  this.registerTask('release', 'Build final packages', ['eslint', 'amd', 'uglify', 'test:min', 'copy:dist', 'copy:components', 'copy:cdnjs']);

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.task.loadTasks('tasks');

  grunt.registerTask('bench', ['metrics']);
  grunt.registerTask('sauce', process.env.SAUCE_USERNAME ? ['tests', 'connect', 'saucelabs-mocha'] : []);

  grunt.registerTask('travis', process.env.PUBLISH ? ['default', 'sauce', 'metrics', 'publish:latest'] : ['default']);

  grunt.registerTask('dev', ['clean', 'connect', 'watch']);
  grunt.registerTask('default', ['clean', 'build', 'test', 'release']);
};
