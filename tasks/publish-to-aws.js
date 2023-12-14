const git = require('./util/git');
const { createRegisterAsyncTaskFn } = require('./util/async-grunt-task');
const semver = require('semver');
const { publishWithSuffixes } = require('./aws-s3-builds-page/publish');
const { generateFileList } = require('./aws-s3-builds-page/generateFileList');

module.exports = function(grunt) {
  const registerAsyncTask = createRegisterAsyncTaskFn(grunt);

  registerAsyncTask('publish-to-aws', async () => {
    grunt.log.writeln('remotes: ' + (await git.remotes()));
    grunt.log.writeln('branches: ' + (await git.branches()));

    const commitInfo = await git.commitInfo();
    grunt.log.writeln('tag: ', commitInfo.tagName);

    const suffixes = [];

    // Publish the master as "latest" and with the commit-id
    if (commitInfo.isMaster) {
      suffixes.push('-latest');
      suffixes.push('-' + commitInfo.headSha);
    }

    // Publish tags by their tag-name
    if (commitInfo.tagName != null && semver.valid(commitInfo.tagName)) {
      suffixes.push('-' + commitInfo.tagName);
    }

    if (suffixes.length > 0) {
      await publishWithSuffixes(suffixes);
      await generateFileList('index');
    }
  });
};
