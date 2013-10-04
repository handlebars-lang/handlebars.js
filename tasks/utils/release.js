var async = require('async'),
    git = require('./util/git'),
    semver = require('semver');

module.exports = function(grunt) {
  grunt.registerTask('version', 'Updates the current release version', function() {
    var done = this.async(),
        pkg = grunt.config('pkg'),
        version = grunt.option('ver');

    if (version === 'major' || version === 'minor' || version === 'patch' || version === 'prerelease') {
      version = semver.inc(pkg.version, version);
    }
    if (!semver.valid(version)) {
      throw new Error('Must provide a version number (Ex: --ver=patch):\n\t' + version + '\n\n');
    }

    pkg.version = version;
    grunt.config('pkg', pkg);

    git.clean(function(err, clean) {
      if (err || !clean) {
        throw new Error('The repository must be clean');
      }

      grunt.log.write('Updating to version ' + version);

      grunt.task.run(['build', 'tag']);

      async.each([
          ['lib/handlebars/base.js', /Handlebars.VERSION = "(.*)";/, 'Handlebars.VERSION = "' + version + '";'],
          ['package.json', /"version":.*/, '"version": "' + version + '",'],
          ['bower.json', /"version":.*/, '"version": "' + version + '",'],
          ['handlebars.js.nuspec', /<version>.*<\/version>/, '<version>' + version + '</version>']
        ],
        function(args, callback) {
          replace.apply(undefined, args);
          git.add(args[0], callback);
        },
        done);
    });
  });

  grunt.registerTask('tag', 'Tags the current release version', function() {
    var done = this.async(),
        name = 'v' + grunt.config('pkg').version;

    async.series([
        function(callback) { git.add('dist/handlebars.js', callback); },
        function(callback) { git.add('dist/handlebars.runtime.js', callback); },
        function(callback) { git.commit(name, callback); },
        function(callback) { git.tag(name, callback); }
      ],
      done);
  });

  function replace(path, regex, replace) {
    var content = grunt.file.read(path);
    content = content.replace(regex, replace);
    grunt.file.write(path, content);
  }
};
