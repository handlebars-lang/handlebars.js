// This test should run with node 0.10 as long as Handlebars has been compiled before
var Handlebars = require('../');
var fs = require('fs');

console.log('Testing build Handlebars with Node version ' + process.version);
var template = fs.readFileSync(require.resolve('./template.txt.hbs'), 'utf-8');
var compiledOutput = Handlebars.compile(template)({author: 'Yehuda'}).trim();
var expectedOutput = fs.readFileSync(require.resolve('./expected.txt'), 'utf-8').trim();

if (compiledOutput !== expectedOutput) {
    throw new Error('Compiled output (' + compiledOutput + ') did not match expected output (' + expectedOutput + ')');
}
console.log('Success');
