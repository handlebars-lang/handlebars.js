var _ = require('underscore'),
    fs = require('fs');

module.exports = function(grunt, callback) {
  var distFiles = fs.readdirSync('dist'),
      distSizes = {};

  _.each(distFiles, function(file) {
    var stat = fs.statSync('dist/' + file);
    distSizes[file.replace(/\.js/, '').replace(/\./g, '_')] = stat.size;
  });

  grunt.log.writeln('Distribution sizes: ' + JSON.stringify(distSizes, undefined, 2));
  callback([distSizes]);
};
