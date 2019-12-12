module.exports = {
  'check-coverage': true,
  branches: 100,
  lines: 100,
  functions: 100,
  statements: 100,
  exclude: ['**/spec/**', '**/handlebars/compiler/parser.js'],
  reporter: 'html'
};
