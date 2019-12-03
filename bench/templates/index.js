var fs = require('fs');

var templates = fs.readdirSync(__dirname);
templates.forEach(function(template) {
  if (template === 'index.js' || !/(.*)\.js$/.test(template)) {
    return;
  }
  module.exports[RegExp.$1] = require('./' + RegExp.$1);
});
