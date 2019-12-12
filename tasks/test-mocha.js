const childProcess = require('child_process');

module.exports = function(grunt) {
  grunt.registerTask(
    'test:mocha',
    promiseBasedTask(async () => forkAndWait('./spec/env/runner'))
  );

  grunt.registerTask(
    'test:cov',
    promiseBasedTask(async () =>
      forkAndWait(
        'node_modules/istanbul/lib/cli.js',
        'cover',
        '--source-map',
        '--',
        './spec/env/runner.js'
      )
    )
  );

  grunt.registerTask(
    'test:min',
    promiseBasedTask(async () => forkAndWait('./spec/env/runner', '--min'))
  );

  grunt.registerTask(
    'test:check-cov',
    promiseBasedTask(() =>
      forkAndWait(
        'node_modules/istanbul/lib/cli.js',
        'check-coverage',
        '--statements',
        '100',
        '--functions',
        '100',
        '--branches',
        '100',
        '--lines 100'
      )
    )
  );

  function promiseBasedTask(asyncFunction) {
    return function() {
      asyncFunction()
        .catch(error => {
          grunt.fatal(error);
        })
        .finally(this.async());
    };
  }

  async function forkAndWait(command, ...args) {
    return new Promise((resolve, reject) => {
      const child = childProcess.fork(command, args, { stdio: 'inherit' });
      child.on('close', code => {
        if (code !== 0) {
          reject(new Error(`Child process failed with exit-code ${code}`));
        }
      });
    });
  }

  grunt.registerTask('test', ['test:bin', 'test:cov', 'test:check-cov']);
};
