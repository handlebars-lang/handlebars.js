var childProcess = require('child_process');

module.exports = {
  clean: function(callback) {
    childProcess.exec('git diff-index --name-only HEAD --', {}, function(err, stdout) {
      callback(undefined, !err && !stdout);
    });
  },

  commitInfo: function(callback) {
    module.exports.head(function(err, headSha) {
      module.exports.master(function(err, masterSha) {
        module.exports.tagName(function(err, tagName) {
          callback(undefined, {
            head: headSha,
            master: masterSha,
            tagName: tagName,
            isMaster: headSha === masterSha
          });
        });
      });
    });
  },

  head: function(callback) {
    childProcess.exec('git rev-parse --short HEAD', {}, function(err, stdout) {
      if (err) {
        throw err;
      }

      callback(undefined, stdout.trim());
    });
  },
  master: function(callback) {
    childProcess.exec('git rev-parse --short origin/master', {}, function(err, stdout) {
      if (err) {
        throw err;
      }

      callback(undefined, stdout.trim());
    });
  },

  add: function(path, callback) {
    childProcess.exec('git add -f ' + path, {}, function(err, stdout) {
      if (err) {
        throw err;
      }

      callback();
    });
  },
  commit: function(name, callback) {
    childProcess.exec('git commit --message=' + name, {}, function(err, stdout) {
      if (err) {
        throw err;
      }

      callback();
    });
  },
  tag: function(name, callback) {
    childProcess.exec('git tag -a --message=' + name + ' ' + name, {}, function(err, stdout, stderr) {
      console.log(name, stdout, stderr);
      if (err) {
        throw err;
      }

      callback();
    });
  },
  tagName: function(callback) {
    childProcess.exec('git tag -l --points-at HEAD', {}, function(err, stdout) {
      if (err) {
        throw err;
      }

      var tags = stdout.trim().split(/\n/),
          versionTags = tags.filter(function(tag) { return /^v/.test(tag); });
      callback(undefined, versionTags[0] || tags[0]);
    });
  }
};
