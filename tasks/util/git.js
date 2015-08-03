var childProcess = require('child_process');

module.exports = {
  debug: function(callback) {
    childProcess.exec('git remote -v', {}, function(err, remotes) {
      if (err) {
        throw new Error('git.remote: ' + err.message);
      }

      childProcess.exec('git branch -a', {}, function(err, branches) {
        if (err) {
          throw new Error('git.branch: ' + err.message);
        }

        callback(remotes, branches);
      });
    });
  },
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
        throw new Error('git.head: ' + err.message);
      }

      callback(undefined, stdout.trim());
    });
  },
  master: function(callback) {
    childProcess.exec('git rev-parse --short origin/master', {}, function(err, stdout) {
      // This will error if master was not checked out but in this case we know we are not master
      // so we can ignore.
      if (err && !(/Needed a single revision/.test(err.message))) {
        throw new Error('git.master: ' + err.message);
      }

      callback(undefined, stdout.trim());
    });
  },

  add: function(path, callback) {
    childProcess.exec('git add -f ' + path, {}, function(err) {
      if (err) {
        throw new Error('git.add: ' + err.message);
      }

      callback();
    });
  },
  commit: function(name, callback) {
    childProcess.exec('git commit --message=' + name, {}, function(err) {
      if (err) {
        throw new Error('git.commit: ' + err.message);
      }

      callback();
    });
  },
  tag: function(name, callback) {
    childProcess.exec('git tag -a --message=' + name + ' ' + name, {}, function(err) {
      if (err) {
        throw new Error('git.tag: ' + err.message);
      }

      callback();
    });
  },
  tagName: function(callback) {
    childProcess.exec('git describe --tags', {}, function(err, stdout) {
      if (err) {
        throw new Error('git.tagName: ' + err.message);
      }

      var tags = stdout.trim().split(/\n/);
      tags = tags.filter(function(info) {
        info = info.split('-');
        return info.length == 1;
      });

      var versionTags = tags.filter(function(info) {
        return (/^v/.test(info[0]));
      });

      callback(undefined, versionTags[0] || tags[0]);
    });
  }
};
