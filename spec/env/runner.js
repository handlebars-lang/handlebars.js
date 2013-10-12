var fs = require('fs'),
    Mocha = require('mocha'),
    path = require('path');

var errors = 0,
    testDir = path.dirname(__dirname),
    grep = process.argv[2];

var files = [ testDir + "/basic.js" ];

var files = fs.readdirSync(testDir)
      .filter(function(name) { return (/.*\.js$/).test(name); })
      .map(function(name) { return testDir + '/' + name; });

run('./node', function() {
  run('./browser', function() {
    run('./runtime', function() {
      process.exit(errors);
    });
  });
});


function run(env, callback) {
  var mocha = new Mocha();
  mocha.ui('bdd');
  mocha.files = files.slice();
  if (grep) {
    mocha.grep(grep);
  }

  files.forEach(function(name) {
    delete require.cache[name];
  });

  console.log('Running env: ' + env);
  require(env);
  mocha.run(function(errorCount) {
    errors += errorCount;
    callback();
  });
}
