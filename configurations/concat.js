module.exports = {
  options: {
    banner: '/*!\n\n <%= pkg.name %> v<%= pkg.version %>\n\n<%= grunt.file.read("LICENSE") %>\n@license\n*/\n',
    process: function(src, name) {
      var match = /\/\/ BEGIN\(BROWSER\)\n((?:.|\n)*)\n\/\/ END\(BROWSER\)/.exec(src);
      return '\n// ' + name + '\n' + (match ? match[1] : src);
    }
  },
  dist: {
    src: [
      'dist/amd/handlebars/browser-prefix.js',
      'dist/amd/handlebars/base.js',
      'dist/amd/handlebars/compiler/parser.js',
      'dist/amd/handlebars/compiler/base.js',
      'dist/amd/handlebars/compiler/ast.js',
      'dist/amd/handlebars/utils.js',
      'dist/amd/handlebars/compiler/compiler.js',
      'dist/amd/handlebars/compiler/javascript-compiler.js',
      'dist/amd/handlebars/runtime.js',
      'dist/amd/handlebars/browser-suffix.js'
    ],
    dest: 'dist/handlebars.js'
  },
  runtime: {
    src: [
      'dist/amd/handlebars/browser-prefix.js',
      'dist/amd/handlebars/base.js',
      'dist/amd/handlebars/utils.js',
      'dist/amd/handlebars/runtime.js',
      'dist/amd/handlebars/browser-suffix.js'
    ],
    dest: 'dist/handlebars.runtime.js'
  }
};
