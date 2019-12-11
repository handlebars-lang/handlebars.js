const _ = require('underscore'),
  async = require('neo-async'),
  AWS = require('aws-sdk'),
  git = require('./util/git'),
  semver = require('semver');

module.exports = function(grunt) {
  grunt.registerTask('publish:latest', function() {
    const done = this.async();

    git.debug(function(remotes, branches) {
      grunt.log.writeln('remotes: ' + remotes);
      grunt.log.writeln('branches: ' + branches);

      git.commitInfo(function(err, info) {
        grunt.log.writeln('tag: ' + info.tagName);

        const files = [];

        // Publish the master as "latest" and with the commit-id
        if (info.isMaster) {
          files.push('-latest');
          files.push('-' + info.head);
        }

        // Publish tags by their tag-name
        if (info.tagName && semver.valid(info.tagName)) {
          files.push('-' + info.tagName);
        }

        if (files.length > 0) {
          initSDK();
          grunt.log.writeln('publishing files: ' + JSON.stringify(files));
          publish(fileMap(files), done);
        } else {
          // Silently ignore for branches
          done();
        }
      });
    });
  });
  grunt.registerTask('publish:version', function() {
    const done = this.async();
    initSDK();

    git.commitInfo(function(err, info) {
      if (!info.tagName) {
        throw new Error('The current commit must be tagged');
      }
      publish(fileMap(['-' + info.tagName]), done);
    });
  });

  function initSDK() {
    const bucket = process.env.S3_BUCKET_NAME,
      key = process.env.S3_ACCESS_KEY_ID,
      secret = process.env.S3_SECRET_ACCESS_KEY;

    if (!bucket || !key || !secret) {
      throw new Error('Missing S3 config values');
    }

    AWS.config.update({ accessKeyId: key, secretAccessKey: secret });
  }
  function publish(files, callback) {
    const s3 = new AWS.S3(),
      bucket = process.env.S3_BUCKET_NAME;

    async.each(
      _.keys(files),
      function(file, callback) {
        const params = {
          Bucket: bucket,
          Key: file,
          Body: grunt.file.read(files[file])
        };
        s3.putObject(params, function(err) {
          if (err) {
            throw err;
          } else {
            grunt.log.writeln('Published ' + file + ' to build server.');
            callback();
          }
        });
      },
      callback
    );
  }
  function fileMap(suffixes) {
    const map = {};
    _.each(
      [
        'handlebars.js',
        'handlebars.min.js',
        'handlebars.runtime.js',
        'handlebars.runtime.min.js'
      ],
      function(file) {
        _.each(suffixes, function(suffix) {
          map[file.replace(/\.js$/, suffix + '.js')] = 'dist/' + file;
        });
      }
    );
    return map;
  }
};
