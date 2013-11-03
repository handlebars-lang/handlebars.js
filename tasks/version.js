var async = require('async'),
    git = require('./util/git'),
    semver = require('semver');

module.exports = function(grunt) {
  grunt.registerTask('version', 'Updates the current release version', function() {
    var done = this.async(),
        pkg = grunt.config('pkg'),
        version = grunt.option('ver');

    if (!semver.valid(version)) {
      throw new Error('Must provide a version number (Ex: --ver=1.0.0):\n\t' + version + '\n\n');
    }

    pkg.version = version;
    grunt.config('pkg', pkg);

    grunt.log.writeln('Updating to version ' + version);

    async.each([
        ['lib/handlebars/base.js', /var VERSION = "(.*)";/, 'var VERSION = "' + version + '";'],
        ['components/bower.json', /"version":.*/, '"version": "' + version + '",'],
        ['components/handlebars.js.nuspec', /<version>.*<\/version>/, '<version>' + version + '</version>']
      ],
      function(args, callback) {
        replace.apply(undefined, args);
        grunt.log.writeln('    - ' + args[0]);
        git.add(args[0], callback);
      },
      function() {
        grunt.task.run(['default']);
        done();
      });
  });

  function replace(path, regex, replace) {
    var content = grunt.file.read(path);
    content = content.replace(regex, replace);
    grunt.file.write(path, content);
  }
};
