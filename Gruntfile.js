var childProcess = require('child_process');

function wildcardResponseIsValid(request) {
  var urlSegments = request.url.split('.'),
      extension   = urlSegments[urlSegments.length-1];
  return (
    ['GET', 'HEAD'].indexOf(request.method.toUpperCase()) > -1 &&
    (urlSegments.length === 1 || extension.indexOf('htm') === 0 || extension.length > 5)
  );
}

function buildWildcardMiddleware(options) {
  return function(request, response, next) {
    if (!wildcardResponseIsValid(request)) { return next(); }

    var wildcard     = (options.wildcard || 'index.html'),
        wildcardPath = options.base + "/" + wildcard;

    fs.readFile(wildcardPath, function(err, data){
      if (err) { return next('ENOENT' === err.code ? null : err); }

      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(data);
    });
  };
}

function middleware(connect, options) {
  return [
    connect['static'](options.base),
    connect.directory(options.base),
    buildWildcardMiddleware(options)
  ];
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

    connect: {
      server: {
        port: 8000,
        hostname: '0.0.0.0',
        base: 'spec/',
        keepalive: true
      }
    },

    transpile: {
      amd: {
        type: "amd",
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
    },

    watch: {
      main: {
        files: ['lib/**/*'],
        tasks: ['build']
      },
      options: {
        debounceDelay: 200
      }
    }
  });

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of the current project", [
                    'jshint',
                    'clean',
                    'parser',
                    'node',
                    'globals']);

  this.registerTask('server', "Starts the server", [
                    'build',
                    'connect',
                    'watch:main']);

  this.registerTask('amd', ['transpile:amd', 'requirejs']);
  this.registerTask('node', ['transpile:cjs']);
  this.registerTask('globals', ['packager-fork']);

  this.registerTask('release', 'Build final packages', ['amd', 'uglify']);

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.task.loadTasks('tasks');

  grunt.registerTask('packager-fork', function() {
    // Allows us to run the packager task out of process to work around the multiple
    // traceur exec issues
    grunt.util.spawn({grunt: true,  args: ['--stack', 'packager'], opts: {stdio: 'inherit'}}, this.async());
  });
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
