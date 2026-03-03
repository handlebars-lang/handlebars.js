const AWS = require('aws-sdk');
const git = require('./util/git');
const { createRegisterAsyncTaskFn } = require('./util/async-grunt-task');
const semver = require('semver');

module.exports = function (grunt) {
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
      initSDK();
      grunt.log.writeln(
        'publishing file-suffixes: ' + JSON.stringify(suffixes)
      );
      await publish(suffixes);
    }
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

  async function publish(suffixes) {
    const publishPromises = suffixes.map((suffix) => publishSuffix(suffix));
    return Promise.all(publishPromises);
  }

  async function publishSuffix(suffix) {
    const filenames = [
      'handlebars.js',
      'handlebars.min.js',
      'handlebars.runtime.js',
      'handlebars.runtime.min.js',
    ];
    const publishPromises = filenames.map(async (filename) => {
      const nameInBucket = getNameInBucket(filename, suffix);
      const localFile = getLocalFile(filename);
      await uploadToBucket(localFile, nameInBucket);
      grunt.log.writeln(
        `Published ${localFile} to build server (${nameInBucket})`
      );
    });
    return Promise.all(publishPromises);
  }

  async function uploadToBucket(localFile, nameInBucket) {
    const bucket = process.env.S3_BUCKET_NAME;
    const uploadParams = {
      Bucket: bucket,
      Key: nameInBucket,
      Body: grunt.file.read(localFile),
    };
    return s3PutObject(uploadParams);
  }
};

function s3PutObject(uploadParams) {
  const s3 = new AWS.S3();
  return new Promise((resolve, reject) => {
    s3.putObject(uploadParams, (err) => {
      if (err != null) {
        return reject(err);
      }
      resolve();
    });
  });
}

function getNameInBucket(filename, suffix) {
  return filename.replace(/\.js$/, suffix + '.js');
}

function getLocalFile(filename) {
  return 'dist/' + filename;
}
