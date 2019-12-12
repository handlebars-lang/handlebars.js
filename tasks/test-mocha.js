const { execNodeJsScriptWithInheritedOutput } = require('./util/exec-file');
const { createRegisterAsyncTaskFn } = require('./util/async-grunt-task');

module.exports = function(grunt) {
  const registerAsyncTask = createRegisterAsyncTaskFn(grunt);

  registerAsyncTask('test:mocha', async () =>
    execNodeJsScriptWithInheritedOutput('./spec/env/runner')
  );

  registerAsyncTask('test:cov', async () =>
    execNodeJsScriptWithInheritedOutput('node_modules/istanbul/lib/cli.js', [
      'cover',
      '--source-map',
      '--',
      './spec/env/runner.js'
    ])
  );

  registerAsyncTask('test:min', async () =>
    execNodeJsScriptWithInheritedOutput('./spec/env/runner', ['--min'])
  );

  registerAsyncTask('test:check-cov', async () =>
    execNodeJsScriptWithInheritedOutput('node_modules/istanbul/lib/cli.js', [
      'check-coverage',
      '--statements',
      '100',
      '--functions',
      '100',
      '--branches',
      '100',
      '--lines 100'
    ])
  );
};
