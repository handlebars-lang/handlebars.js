/* eslint-disable no-console */
var fs = require('fs'),
  Mocha = require('mocha'),
  path = require('path');

var errors = 0,
  testDir = path.dirname(__dirname),
  grep = process.argv[2];

// Lazy hack, but whatever
if (grep === '--min') {
  global.minimizedTest = true;
  grep = undefined;
}

var files = fs
  .readdirSync(testDir)
  .filter(function (name) {
    return /.*\.js$/.test(name);
  })
  .map(function (name) {
    return testDir + path.sep + name;
  });

if (global.minimizedTest) {
  run('./runtime.js', function () {
    run('./browser.js', function () {
      /* eslint-disable no-process-exit */
      process.exit(errors);
      /* eslint-enable no-process-exit */
    });
  });
} else {
  run('./runtime.js', function () {
    run('./browser.js', function () {
      run('./node.js', function () {
        run('./node-esm.mjs', function () {
          /* eslint-disable no-process-exit */
          process.exit(errors);
          /* eslint-enable no-process-exit */
        });
      });
    });
  });
}

function run(env, callback) {
  var mocha = new Mocha();
  mocha.ui('bdd');
  mocha.files = files.slice();
  if (grep) {
    mocha.grep(grep);
  }

  files.forEach(function (name) {
    delete require.cache[name];
  });

  console.log('Running env: ' + env);
  import(env).then(() => {
    mocha.run(function (errorCount) {
      errors += errorCount;
      callback();
    });
  });
}
