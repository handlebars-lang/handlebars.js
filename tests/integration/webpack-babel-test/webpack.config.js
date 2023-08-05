const fs = require('fs');

const testFiles = fs.readdirSync('src');
const entryPoints = {};
testFiles
  .filter(file => file.match(/-cli.js$/))
  .forEach(file => {
    entryPoints[file] = `./src/${file}`;
  });

module.exports = {
  entry: entryPoints,
  output: {
    filename: '[name]',
    path: __dirname + '/dist'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: false }
        }
      }
    ]
  },
  optimization: {
    minimize: false
  }
};
