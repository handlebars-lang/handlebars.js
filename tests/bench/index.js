var fs = require('fs');

var metrics = fs.readdirSync(__dirname);
metrics.forEach(function (metric) {
  if (metric === 'index.js' || !/(.*)\.js$/.test(metric)) {
    return;
  }

  var name = RegExp.$1;
  metric = require('./' + name);
  if (metric instanceof Function) {
    module.exports[name] = metric;
  }
});
