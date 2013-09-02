module.exports = {
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
};
