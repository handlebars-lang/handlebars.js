module.exports = {
  'check-coverage': true,
  // TODO - can probably be increased once @handlebars/parser fixes its exports
  branches: 98,
  lines: 100,
  functions: 100,
  statements: 100,
  exclude: ['**/spec/**'],
  reporter: 'html',
};
