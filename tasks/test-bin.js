const childProcess = require('child_process'),
  fs = require('fs'),
  os = require('os'),
  expect = require('chai').expect,
  util = require('util');

const readFile = util.promisify(fs.readFile);
const execFile = util.promisify(childProcess.execFile);

module.exports = function(grunt) {
  grunt.registerTask(
    'test:bin',
    wrapAsync(async function() {
      const { stdout } = await execFileWithWin32Fallback('./bin/handlebars', [
        '-a',
        'spec/artifacts/empty.handlebars'
      ]);

      const expectedOutput = await readFile(
        './spec/expected/empty.amd.js',
        'utf-8'
      );

      const normalizedOutput = normalizeCrlf(stdout);
      const normalizedExpectedOutput = normalizeCrlf(expectedOutput);
      expect(normalizedOutput).to.equal(normalizedExpectedOutput);
    })
  );

  async function execFileWithWin32Fallback(command, args) {
    // On Windows, the executable handlebars.js file cannot be run directly
    if (os.platform() === 'win32') {
      args.unshift(command);
      command = process.argv[0];
    }
    return execFile(command, args, { encoding: 'utf-8' });
  }

  function normalizeCrlf(string) {
    if (string != null) {
      return string.replace(/\r\n/g, '\n');
    }
    return string;
  }

  function wrapAsync(asyncFunction) {
    return function() {
      asyncFunction()
        .catch(error => {
          grunt.fatal(error);
        })
        .finally(this.async());
    };
  }
};
