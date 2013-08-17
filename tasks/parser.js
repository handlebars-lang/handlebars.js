var childProcess = require('child_process');

module.exports = function(grunt) {
  grunt.registerTask('parser', 'Generate jison parser.', function() {
    var done = this.async();

    var child = childProcess.spawn('./node_modules/.bin/jison', ['-m', 'js', 'src/handlebars.yy', 'src/handlebars.l'], {stdio: 'inherit'});
    child.on('exit', function(code) {
      if (code != 0) {
        grunt.fatal('Jison failure: ' + code);
        done();
        return;
      }

      var src = ['src/parser-prefix.js', 'handlebars.js', 'src/parser-suffix.js'].map(grunt.file.read).join('');
      grunt.file.delete('handlebars.js');

      grunt.file.write('lib/handlebars/compiler/parser.js', src);
      grunt.log.writeln('Parser "lib/handlebars/compiler/parser.js" created.');
      done();
    });
  });
};
