/* eslint-disable no-process-env */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      files: [
        '*.js',
        'bench/**/*.js',
        'tasks/**/*.js',
        'lib/**/!(*.min|parser).js',
        'spec/**/!(*.amd|json2|require).js',
        'integration-testing/multi-nodejs-test/*.js',
        'integration-testing/webpack-test/*.js',
        'integration-testing/webpack-test/src/*.js'
      ]
    },

    clean: ['tmp', 'dist', 'lib/handlebars/compiler/parser.js', 'integration-testing/**/node_modules'],

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
    webpack: {
      build: require('./webpack.config')
    },
    babel: {
      options: {
        sourceMaps: 'inline',
        auxiliaryCommentBefore: 'istanbul ignore next'
      },
      amd: {
        options: {
          plugins: ['@babel/plugin-transform-modules-amd']
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
          plugins: [
            '@babel/plugin-transform-modules-commonjs',
            // support "import * as Handlebars" for backward-compatibility
            'babel-plugin-add-module-exports'
          ]
        },
        files: [{
          cwd: 'lib/',
          expand: true,
          src: '**/!(index).js',
          dest: 'dist/cjs/'
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
            // {browserName: 'safari', version: 9, platform: 'OS X 10.11'},
            // {browserName: 'safari', version: 8, platform: 'OS X 10.10'},
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

    bgShell: {
      checkTypes: {
        cmd: 'npm run checkTypes',
        bg: false,
        fail: true
      },
      integrationTests: {
        cmd: './integration-testing/run-integration-tests.sh',
        bg: false,
        fail: true
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
                    'bgShell:checkTypes',
                    'parser',
                    'node',
                    'globals']);

  this.registerTask('amd', ['babel:amd']);
  this.registerTask('node', ['babel:cjs']);
  this.registerTask('globals', ['webpack']);
  this.registerTask('tests', ['concat:tests']);

  this.registerTask('release', 'Build final packages', ['eslint', 'amd', 'test:min', 'copy:dist', 'copy:components', 'copy:cdnjs']);

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('@knappi/grunt-saucelabs');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.task.loadTasks('tasks');

  grunt.registerTask('bench', ['metrics']);
  grunt.registerTask('sauce', process.env.SAUCE_USERNAME ? ['tests', 'connect', 'saucelabs-mocha'] : []);

  grunt.registerTask('travis', process.env.PUBLISH ? ['default', 'bgShell:integrationTests', 'sauce', 'metrics', 'publish:latest'] : ['default']);

  grunt.registerTask('dev', ['clean', 'connect', 'watch']);
  grunt.registerTask('default', ['clean', 'build', 'test', 'release']);
  grunt.registerTask('integration-tests', ['default', 'bgShell:integrationTests']);
};
