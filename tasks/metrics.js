const metrics = require('../tests/bench');
const { createRegisterAsyncTaskFn } = require('./util/async-grunt-task');

module.exports = function (grunt) {
  const registerAsyncTask = createRegisterAsyncTaskFn(grunt);

  registerAsyncTask('metrics', function () {
    const onlyExecuteName = grunt.option('name');
    const events = {};

    const promises = Object.keys(metrics).map(async (name) => {
      if (/^_/.test(name)) {
        return;
      }
      if (onlyExecuteName != null && name !== onlyExecuteName) {
        return;
      }

      return new Promise((resolve) => {
        metrics[name](grunt, function (data) {
          events[name] = data;
          resolve();
        });
      });
    });

    return Promise.all(promises);
  });
};
