module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        banner: '/*!\n\n <%= pkg.name %> v<%= pkg.version %>\n\n<%= grunt.file.read("LICENSE") %>\n@license\n*/\n',
        process: function(src, name) {
          var match = /\/\/ BEGIN\(BROWSER\)\n((?:.|\n)*)\n\/\/ END\(BROWSER\)/.exec(src);
          return '\n// ' + name + '\n' + (match ? match[1] : src);
        },
        separator: ';'
      },
      dist: {
        src: [
          'lib/handlebars/browser-prefix.js',
          'lib/handlebars/base.js',
          'lib/handlebars/compiler/parser.js',
          'lib/handlebars/compiler/base.js',
          'lib/handlebars/compiler/ast.js',
          'lib/handlebars/utils.js',
          'lib/handlebars/compiler/compiler.js',
          'lib/handlebars/compiler/javascript-compiler.js',
          'lib/handlebars/runtime.js',
          'lib/handlebars/browser-suffix.js'
        ],
        dest: 'dist/handlebars.js'
      },
      runtime: {
        src: [
          'lib/handlebars/browser-prefix.js',
          'lib/handlebars/base.js',
          'lib/handlebars/utils.js',
          'lib/handlebars/runtime.js',
          'lib/handlebars/browser-suffix.js'
        ],
        dest: 'dist/handlebars.runtime.js'
      }
    },
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

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('dist-dir', function() {
    grunt.file.delete('dist');
    grunt.file.mkdir('dist');
  });


  grunt.registerTask('default', ['dist-dir', 'concat', 'uglify']);
};
