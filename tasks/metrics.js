var _ = require('underscore'),
    async = require('async'),
    git = require('./util/git'),
    Keen = require('keen.io'),
    metrics = require('../bench');

module.exports = function(grunt) {
  grunt.registerTask('metrics', function() {
    var done = this.async(),
        execName = grunt.option('name'),
        events = {},

        projectId = process.env.KEEN_PROJECTID,
        writeKey = process.env.KEEN_WRITEKEY,
        keen;

    if (!execName && projectId && writeKey) {
      keen = Keen.configure({
        projectId: projectId,
        writeKey: writeKey
      });
    }

    async.each(_.keys(metrics), function(name, complete) {
        if (/^_/.test(name) || (execName && name !== execName)) {
          return complete();
        }

        metrics[name](grunt, function(data) {
          events[name] = data;
          complete();
        });
      },
      function() {
        if (!keen) {
          return done();
        }

        emit(keen, events, function(err, res) {
          if (err) {
            throw err;
          }

          grunt.log.writeln('Metrics recorded.');
          done();
        });
      });
  });
};
function emit(keen, collections, callback) {
  git.commitInfo(function(err, info) {
    _.each(collections, function(collection) {
      _.each(collection, function(event) {
        if (info.tagName) {
          event.tag = info.tagName;
        }
        event.sha = info.head;
      });
    });

    keen.addEvents(collections, callback);
  });
}
