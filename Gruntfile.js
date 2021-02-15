/* eslint-disable no-process-env */
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['tmp', 'dist', 'integration-testing/**/node_modules'],

    copy: {
      dist: {
        options: {
          processContent: function(content) {
            return (
              grunt.template.process(
                '/**!\n\n @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt Expat\n <%= pkg.name %> v<%= pkg.version %>\n\n<%= grunt.file.read("LICENSE") %>\n*/\n'
              ) +
              content +
              '\n// @license-end\n'
            );
          }
        },
        files: [{ expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/' }]
      },
      components: {
        files: [
          {
            expand: true,
            cwd: 'components/',
            src: ['**'],
            dest: 'dist/components'
          },
          { expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/components' }
        ]
      }
    },

    babel: {
      options: {
        sourceMaps: 'inline',
        loose: ['es6.modules'],
        auxiliaryCommentBefore: 'istanbul ignore next'
      },
      cjs: {
        files: [
          {
            cwd: 'lib/',
            expand: true,
            src: '**/!(index).js',
            dest: 'dist/cjs/'
          }
        ]
      }
    },
    webpack: {
      options: {
        context: __dirname,
        output: {
          path: 'dist/',
          library: 'Handlebars',
          libraryTarget: 'umd'
        }
      },
      handlebars: {
        entry: './dist/cjs/handlebars.js',
        output: {
          filename: 'handlebars.js'
        }
      },
      runtime: {
        entry: './dist/cjs/handlebars.runtime.js',
        output: {
          filename: 'handlebars.runtime.js'
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
        files: [
          {
            cwd: 'dist/',
            expand: true,
            src: ['handlebars*.js', '!*.min.js'],
            dest: 'dist/',
            rename: function(dest, src) {
              return dest + src.replace(/\.js$/, '.min.js');
            }
          }
        ]
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
          urls: ['http://localhost:9999/spec/?headless=true'],
          detailedError: true,
          concurrency: 4,
          browsers: [
            { browserName: 'chrome' },
            { browserName: 'firefox', platform: 'Linux' },
            // {browserName: 'safari', version: 9, platform: 'OS X 10.11'},
            // {browserName: 'safari', version: 8, platform: 'OS X 10.10'},
            {
              browserName: 'internet explorer',
              version: 11,
              platform: 'Windows 8.1'
            },
            {
              browserName: 'internet explorer',
              version: 10,
              platform: 'Windows 8'
            }
          ]
        }
      },
      sanity: {
        options: {
          build: process.env.TRAVIS_JOB_ID,
          urls: [
            'http://localhost:9999/spec/umd.html?headless=true',
            'http://localhost:9999/spec/umd-runtime.html?headless=true'
          ],
          detailedError: true,
          concurrency: 2,
          browsers: [
            { browserName: 'chrome' },
            {
              browserName: 'internet explorer',
              version: 10,
              platform: 'Windows 8'
            }
          ]
        }
      }
    },

    bgShell: {
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
        tasks: ['on-file-change']
      }
    }
  });

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('@knappi/grunt-saucelabs');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.task.loadTasks('tasks');

  this.registerTask(
    'build',
    'Builds a distributable version of the current project',
    ['node', 'globals']
  );

  this.registerTask('node', ['babel:cjs']);
  this.registerTask('globals', ['webpack']);

  this.registerTask('release', 'Build final packages', [
    'uglify',
    'test:min',
    'copy:dist',
    'copy:components'
  ]);

  this.registerTask('test', ['test:bin', 'test:cov']);

  grunt.registerTask('bench', ['metrics']);

  if (process.env.SAUCE_ACCESS_KEY) {
    grunt.registerTask('sauce', ['concat:tests', 'connect', 'saucelabs-mocha']);
  } else {
    grunt.registerTask('sauce', []);
  }

  // Requires secret properties (saucelabs-credentials etc.) from .travis.yaml
  grunt.registerTask('extensive-tests-and-publish-to-aws', [
    'default',
    'bgShell:integrationTests',
    'sauce',
    'metrics',
    'publish-to-aws'
  ]);
  grunt.registerTask('on-file-change', ['build', 'concat:tests', 'test']);

  // === Primary tasks ===
  grunt.registerTask('dev', ['clean', 'connect', 'watch']);
  grunt.registerTask('default', ['clean', 'build', 'test', 'release']);
  grunt.registerTask('integration-tests', [
    'default',
    'bgShell:integrationTests'
  ]);
};
