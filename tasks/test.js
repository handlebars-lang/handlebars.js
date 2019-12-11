const childProcess = require('child_process'),
  fs = require('fs'),
  os = require('os');

module.exports = function(grunt) {
  grunt.registerTask('test:bin', function() {
    const done = this.async();

    let cmd = './bin/handlebars';
    const args = ['-a', 'spec/artifacts/empty.handlebars'];

    // On Windows, the executable handlebars.js file cannot be run directly
    if (os.platform() === 'win32') {
      args.unshift(cmd);
      cmd = process.argv[0];
    }
    childProcess.execFile(cmd, args, function(err, stdout) {
      if (err) {
        throw err;
      }

      const expected = fs
        .readFileSync('./spec/expected/empty.amd.js')
        .toString()
        .replace(/\r\n/g, '\n');

      if (stdout.toString() !== expected) {
        throw new Error(
          'Expected binary output differed:\n\n"' +
            stdout +
            '"\n\n"' +
            expected +
            '"'
        );
      }

      done();
    });
  });
  grunt.registerTask('test:mocha', function() {
    const done = this.async();

    const runner = childProcess.fork('./spec/env/runner', [], {
      stdio: 'inherit'
    });
    runner.on('close', function(code) {
      if (code !== 0) {
        grunt.fatal(code + ' tests failed');
      }
      done();
    });
  });
  grunt.registerTask('test:cov', function() {
    const done = this.async();

    const runner = childProcess.spawn(
      'node_modules/istanbul/lib/cli.js',
      ['cover', '--source-map', '--', './spec/env/runner.js'],
      { stdio: 'inherit' }
    );
    runner.on('exit', function(code) {
      if (code !== 0) {
        grunt.fatal(code + ' tests failed');
      }
      done();
    });
  });
  grunt.registerTask('test:min', function() {
    const done = this.async();

    const runner = childProcess.fork('./spec/env/runner', ['--min'], {
      stdio: 'inherit'
    });
    runner.on('close', function(code) {
      if (code !== 0) {
        grunt.fatal(code + ' tests failed');
      }
      done();
    });
  });

  grunt.registerTask('test:check-cov', function() {
    const done = this.async();

    const runner = childProcess.fork(
      'node_modules/istanbul/lib/cli.js',
      [
        'check-coverage',
        '--statements',
        '100',
        '--functions',
        '100',
        '--branches',
        '100',
        '--lines 100'
      ],
      { stdio: 'inherit' }
    );
    runner.on('close', function(code) {
      if (code != 0) {
        grunt.fatal('Coverage check failed: ' + code);
      }
      done();
    });
  });
  grunt.registerTask('test', ['test:bin', 'test:cov', 'test:check-cov']);
};
