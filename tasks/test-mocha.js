const { execNodeJsScriptWithInheritedOutput } = require('./util/exec-file');
const { createRegisterAsyncTaskFn } = require('./util/async-grunt-task');
const nodeJs = process.argv0;

module.exports = function(grunt) {
  const registerAsyncTask = createRegisterAsyncTaskFn(grunt);

  registerAsyncTask('test:mocha', async () =>
    execNodeJsScriptWithInheritedOutput('./spec/env/runner')
  );

  registerAsyncTask('test:cov', async () =>
    execNodeJsScriptWithInheritedOutput('node_modules/nyc/bin/nyc', [
      nodeJs,
      './spec/env/runner.js'
    ])
  );

  registerAsyncTask('test:min', async () =>
    execNodeJsScriptWithInheritedOutput('./spec/env/runner', ['--min'])
  );
};
