var childProcess = require('child_process'),
    fs = require('fs');

module.exports = function(grunt) {
  grunt.registerTask('test:bin', function() {
    var done = this.async();

    childProcess.exec('./bin/handlebars -a spec/artifacts/empty.handlebars', function(err, stdout) {
      if (err) {
        throw err;
      }

      var expected = fs.readFileSync('./spec/expected/empty.amd.js');
      if (stdout.toString() !== expected.toString()) {
        throw new Error('Expected binary output differed:\n\n"' + stdout + '"\n\n"' + expected + '"');
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
  grunt.registerTask('test:cov', function() {
    var done = this.async();

    var runner = childProcess.fork('node_modules/.bin/istanbul', ['cover', '--', './spec/env/runner.js'], {stdio: 'inherit'});
    runner.on('close', function(code) {
      if (code != 0) {
        grunt.fatal(code + ' tests failed');
      }
      done();
    });
  });
  grunt.registerTask('test', ['test:bin', 'test:cov']);
};
