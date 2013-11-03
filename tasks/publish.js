var _ = require('underscore'),
    async = require('async'),
    AWS = require('aws-sdk'),
    git = require('./util/git'),
    semver = require('semver');

module.exports = function(grunt) {
  grunt.registerTask('publish:latest', function() {
    var done = this.async();

    git.debug(function(remotes, branches) {
      grunt.log.writeln('remotes: ' + remotes);
      grunt.log.writeln('branches: ' + branches);

      git.commitInfo(function(err, info) {
        grunt.log.writeln('tag: ' + info.tagName);

        if (info.isMaster) {
          initSDK();

          var files = ['-latest', '-' + info.head];
          if (info.tagName && semver.valid(info.tagName)) {
            files.push('-' + info.tagName);
          }

          publish(fileMap(files), done);
        } else {
          // Silently ignore for branches
          done();
        }
      });
    });
  });
  grunt.registerTask('publish:version', function() {
    var done = this.async();
    initSDK();

    git.commitInfo(function(err, info) {
      if (!info.tagName) {
        throw new Error('The current commit must be tagged');
      }
      publish(fileMap(['-' + info.tagName]), done);
    });
  });

  function initSDK() {
    var bucket = process.env.S3_BUCKET_NAME,
        key = process.env.S3_ACCESS_KEY_ID,
        secret = process.env.S3_SECRET_ACCESS_KEY;

    if (!bucket || !key || !secret) {
      throw new Error('Missing S3 config values');
    }

    AWS.config.update({accessKeyId: key, secretAccessKey: secret});
  }
  function publish(files, callback) {
    var s3 = new AWS.S3(),
        bucket = process.env.S3_BUCKET_NAME;

    async.forEach(_.keys(files), function(file, callback) {
        var params = {Bucket: bucket, Key: file, Body: grunt.file.read(files[file])};
        s3.putObject(params, function(err, data) {
          if (err) {
            throw err;
          } else {
            grunt.log.writeln('Published ' + file + ' to build server.');
            callback();
          }
        });
      },
      callback);
  }
  function fileMap(suffixes) {
    var map = {};
    _.each(['handlebars.js', 'handlebars.min.js', 'handlebars.runtime.js', 'handlebars.runtime.min.js'], function(file) {
      _.each(suffixes, function(suffix) {
        map[file.replace(/\.js$/, suffix + '.js')] = 'dist/' + file;
      });
    });
    return map;
  }
};
