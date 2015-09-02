var _ = require('underscore'),
    async = require('async'),
    metrics = require('../bench');

module.exports = function(grunt) {
  grunt.registerTask('metrics', function() {
    var done = this.async(),
        execName = grunt.option('name'),
        events = {};

    async.each(_.keys(metrics), function(name, complete) {
        if (/^_/.test(name) || (execName && name !== execName)) {
          return complete();
        }

        metrics[name](grunt, function(data) {
          events[name] = data;
          complete();
        });
      },
      done);
  });
};
