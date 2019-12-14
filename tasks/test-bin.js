const childProcess = require('child_process'),
  fs = require('fs'),
  os = require('os'),
  expect = require('chai').expect;

module.exports = function(grunt) {
  grunt.registerTask('test:bin', function() {
    const stdout = executeBinHandlebars(
      '-a',
      'spec/artifacts/empty.handlebars'
    );

    const expectedOutput = fs.readFileSync(
      './spec/expected/empty.amd.js',
      'utf-8'
    );

    const normalizedOutput = normalizeCrlf(stdout);
    const normalizedExpectedOutput = normalizeCrlf(expectedOutput);

    expect(normalizedOutput).to.equal(normalizedExpectedOutput);
  });
};

// helper functions

function executeBinHandlebars(...args) {
  if (os.platform() === 'win32') {
    // On Windows, the executable handlebars.js file cannot be run directly
    const nodeJs = process.argv[0];
    return execFilesSyncUtf8(nodeJs, ['./bin/handlebars'].concat(args));
  }
  return execFilesSyncUtf8('./bin/handlebars', args);
}

function execFilesSyncUtf8(command, args) {
  return childProcess.execFileSync(command, args, { encoding: 'utf-8' });
}

function normalizeCrlf(string) {
  if (typeof string === 'string') {
    return string.replace(/\r\n/g, '\n');
  }
  return string;
}
