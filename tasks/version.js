const git = require('./util/git');
const semver = require('semver');
const { createRegisterAsyncTaskFn } = require('./util/async-grunt-task');

module.exports = function (grunt) {
  const registerAsyncTask = createRegisterAsyncTaskFn(grunt);

  registerAsyncTask('version', async () => {
    const pkg = grunt.config('pkg');
    const version = grunt.option('ver');
    if (!semver.valid(version)) {
      throw new Error(
        'Must provide a version number (Ex: --ver=1.0.0):\n\t' +
          version +
          '\n\n'
      );
    }
    pkg.version = version;
    grunt.config('pkg', pkg);

    const replaceSpec = [
      {
        path: 'lib/handlebars/base.js',
        regex: /const VERSION = ['"](.*)['"];/,
        replacement: `const VERSION = '${version}';`,
      },
      {
        path: 'components/bower.json',
        regex: /"version":.*/,
        replacement: `"version": "${version}",`,
      },
      {
        path: 'components/package.json',
        regex: /"version":.*/,
        replacement: `"version": "${version}",`,
      },
      {
        path: 'components/handlebars.js.nuspec',
        regex: /<version>.*<\/version>/,
        replacement: `<version>${version}</version>`,
      },
    ];

    await Promise.all(
      replaceSpec.map((replaceSpec) =>
        replaceAndAdd(
          replaceSpec.path,
          replaceSpec.regex,
          replaceSpec.replacement
        )
      )
    );
    grunt.task.run(['default']);
  });

  async function replaceAndAdd(path, regex, value) {
    let content = grunt.file.read(path);
    content = content.replace(regex, value);
    grunt.file.write(path, content);
    await git.add(path);
  }
};
