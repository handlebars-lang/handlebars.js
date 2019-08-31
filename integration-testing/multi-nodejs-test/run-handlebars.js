// This test should run successfully with node 0.10 as long as Handlebars has been compiled before
var assert = require('assert');
var Handlebars = require('../../');

console.log('Testing build Handlebars with Node version ' + process.version);

var output = Handlebars.compile('Author: {{author}}')({author: 'Yehuda'});
if (output !== 'Author: Yehuda') {
    throw new Error('Compiled output (' + compiledOutput + ') did not match expected output (' + expectedOutput + ')');
}

assert.equal(output, 'Author: Yehuda')

console.log('Success');
