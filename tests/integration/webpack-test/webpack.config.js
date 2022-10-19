const fs = require('fs');

const testFiles = fs.readdirSync('src');
const entryPoints = {};
testFiles
  .filter((file) => file.match(/-test.js$/))
  .forEach((file) => {
    entryPoints[file] = `./src/${file}`;
  });

module.exports = {
  entry: entryPoints,
  mode: 'production',
  target: 'web',
  output: {
    filename: '[name]',
    path: __dirname + '/dist',
  },
  module: {
    rules: [{ test: /\.handlebars$/, loader: 'handlebars-loader' }],
  },
};
