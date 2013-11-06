var childProcess = require('child_process'),
    fs = require('fs');

module.exports = function(grunt) {
  grunt.registerTask('test:bin', function() {
    var done = this.async();

    childProcess.exec('./bin/handlebars -a spec/artifacts/empty.handlebars', function(err, stdout) {
      if (err) {
        throw err;
      }

      if (stdout.toString() !== fs.readFileSync('./spec/expected/empty.amd.js').toString()) {
        throw new Error('Expected binary output differed');
      }

      done();
    });
  });
  grunt.registerTask('test:mocha', function() {
    var done = this.async();

    var runner = childProcess.fork('./spec/env/runner', [], {stdio: 'inherit'});
    runner.on('close', function(code) {
      if (code != 0) {
        grunt.fatal(code + ' tests failed');
      }
      done();
    });
  });
  grunt.registerTask('test', ['test:bin', 'test:mocha']);
};
