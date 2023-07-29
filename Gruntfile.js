/* eslint-disable no-process-env */
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['tmp', 'dist', 'tests/integration/**/node_modules'],

    copy: {
      dist: {
        options: {
          processContent: function (content) {
            return (
              grunt.template.process(
                '/**!\n\n @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt Expat\n <%= pkg.name %> v<%= pkg.version %>\n\n<%= grunt.file.read("LICENSE") %>\n*/\n'
              ) +
              content +
              '\n// @license-end\n'
            );
          },
        },
        files: [{ expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/' }],
      },
      components: {
        files: [
          {
            expand: true,
            cwd: 'components/',
            src: ['**'],
            dest: 'dist/components',
          },
          {
            expand: true,
            cwd: 'dist/',
            src: ['*.js'],
            dest: 'dist/components',
          },
        ],
      },
    },

    babel: {
      options: {
        sourceMaps: 'inline',
        loose: ['es6.modules'],
        auxiliaryCommentBefore: 'istanbul ignore next',
      },
      cjs: {
        files: [
          {
            cwd: 'lib/',
            expand: true,
            src: '**/!(index).js',
            dest: 'dist/cjs/',
          },
        ],
      },
    },
    webpack: {
      options: {
        context: __dirname,
        output: {
          path: 'dist/',
          library: 'Handlebars',
          libraryTarget: 'umd',
        },
      },
      handlebars: {
        entry: './dist/cjs/handlebars.js',
        output: {
          filename: 'handlebars.js',
        },
      },
      runtime: {
        entry: './dist/cjs/handlebars.runtime.js',
        output: {
          filename: 'handlebars.runtime.js',
        },
      },
    },

    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: /(?:^!|@(?:license|preserve|cc_on))/,
      },
      dist: {
        files: [
          {
            cwd: 'dist/',
            expand: true,
            src: ['handlebars*.js', '!*.min.js'],
            dest: 'dist/',
            rename: function (dest, src) {
              return dest + src.replace(/\.js$/, '.min.js');
            },
          },
        ],
      },
    },

    concat: {
      tests: {
        src: ['spec/!(require).js'],
        dest: 'tmp/tests.js',
      },
    },

    connect: {
      server: {
        options: {
          base: '.',
          hostname: '*',
          port: 9999,
        },
      },
    },

    shell: {
      integrationTests: {
        command: './tests/integration/run-integration-tests.sh',
      },
    },

    watch: {
      scripts: {
        options: {
          atBegin: true,
        },

        files: ['src/*', 'lib/**/*.js', 'spec/**/*.js'],
        tasks: ['on-file-change'],
      },
    },
  });

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.task.loadTasks('tasks');

  grunt.registerTask('node', ['babel:cjs']);
  grunt.registerTask('globals', ['webpack']);
  grunt.registerTask('release', 'Build final packages', [
    'uglify',
    'test:min',
    'copy:dist',
    'copy:components',
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
    ['node', 'globals']
  );
  grunt.registerTask('integration-tests', [
    'default',
    'shell:integrationTests',
  ]);
};
