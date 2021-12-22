/* eslint-disable no-process-env */
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: [
      'tmp',
      'dist',
      'lib/handlebars/compiler/parser.js',
      '/tests/integration/**/node_modules'
    ],

    copy: {
      dist: {
        options: {
          processContent: function(content) {
            return (
              grunt.template.process(
                '/**!\n\n @license\n <%= pkg.name %> v<%= pkg.version %>\n\n<%= grunt.file.read("LICENSE") %>\n*/\n'
              ) + content
            );
          }
        },
        files: [{ expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/' }]
      },
      cdnjs: {
        files: [
          { expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/cdnjs' }
        ]
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
      amd: {
        options: {
          modules: 'amd'
        },
        files: [
          {
            expand: true,
            cwd: 'lib/',
            src: '**/!(index).js',
            dest: 'dist/amd/'
          }
        ]
      },

      cjs: {
        options: {
          modules: 'common'
        },
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
        module: {
          loaders: [
            // the optional 'runtime' transformer tells babel to require the runtime instead of inlining it.
            {
              test: /\.jsx?$/,
              exclude: /node_modules/,
              loader:
                'babel-loader?optional=runtime&loose=es6.modules&auxiliaryCommentBefore=istanbul%20ignore%20next'
            }
          ]
        },
        output: {
          path: 'dist/',
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

    bgShell: {
      integrationTests: {
        cmd: './tests/integration/run-integration-tests.sh',
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
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.task.loadTasks('tasks');

  grunt.registerTask('node', ['babel:cjs']);
  grunt.registerTask('amd', ['babel:amd', 'requirejs']);
  grunt.registerTask('globals', ['webpack']);
  grunt.registerTask('release', 'Build final packages', [
    'uglify',
    'test:min',
    'copy:dist',
    'copy:components',
    'copy:cdnjs'
  ]);

  // Requires secret properties from .travis.yaml
  grunt.registerTask('extensive-tests-and-publish-to-aws', [
    'default',
    'bgShell:integrationTests',
    'metrics',
    'publish-to-aws'
  ]);

  grunt.registerTask('on-file-change', ['build', 'concat:tests', 'test']);

  // === Primary tasks ===
  grunt.registerTask('dev', ['clean', 'connect', 'watch']);
  grunt.registerTask('default', ['clean', 'build', 'test', 'release']);
  grunt.registerTask('test', ['test:bin', 'test:cov']);
  grunt.registerTask('bench', ['metrics']);
  grunt.registerTask('prepare', ['build', 'concat:tests']);
  grunt.registerTask(
    'build',
    'Builds a distributable version of the current project',
    ['parser', 'node', 'amd', 'globals']
  );
  grunt.registerTask('integration-tests', [
    'default',
    'bgShell:integrationTests'
  ]);
};
