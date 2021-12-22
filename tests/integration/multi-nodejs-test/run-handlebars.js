// This test should run successfully with node 0.10++ as long as Handlebars has been compiled before
var assert = require('assert');
var Handlebars = require('handlebars');

console.log('Testing built Handlebars with Node version ' + process.version);

var template = Handlebars.compile('Author: {{author}}');
var output = template({ author: 'Yehuda' });
assert.strictEqual(output, 'Author: Yehuda');

console.log('Success');
