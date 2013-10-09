var _ = require('underscore'),
    async = require('async'),
    fs = require('fs'),
    zlib = require('zlib');

module.exports = function(grunt, callback) {
  var distFiles = fs.readdirSync('dist'),
      distSizes = {};

  async.each(distFiles, function(file, callback) {
      grunt.log.writeln('Dist size: "dist/' + file + '"');
      var content = fs.readFileSync('dist/' + file);

      file = file.replace(/\.js/, '').replace(/\./g, '_');
      distSizes[file] = content.length;

      zlib.gzip(content, function(err, data) {
        if (err) {
          throw err;
        }

        distSizes[file + '_gz'] = data.length;
        callback();
      });
    },
    function() {
      grunt.log.writeln('Distribution sizes: ' + JSON.stringify(distSizes, undefined, 2));
      callback([distSizes]);
    });
};
