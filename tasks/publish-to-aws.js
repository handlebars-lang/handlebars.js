/* eslint-disable no-console */
const fs = require('fs');
const { S3, PutObjectCommand } = require('@aws-sdk/client-s3');
const git = require('./util/git');
const semver = require('semver');

let s3Client;

async function main() {
  console.log('remotes: ' + (await git.remotes()));
  console.log('branches: ' + (await git.branches()));

  const commitInfo = await git.commitInfo();
  console.log('tag: ', commitInfo.tagName);

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
    validateS3Env();
    console.log('publishing file-suffixes: ' + JSON.stringify(suffixes));
    await publish(suffixes);
  }
}

function validateS3Env() {
  const bucket = process.env.S3_BUCKET_NAME,
    region = process.env.S3_REGION,
    key = process.env.S3_ACCESS_KEY_ID,
    secret = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !region || !key || !secret) {
    throw new Error('Missing S3 config values');
  }
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
    console.log(`Published ${localFile} to build server (${nameInBucket})`);
  });
  return Promise.all(publishPromises);
}

async function uploadToBucket(localFile, nameInBucket) {
  const s3 = getS3Client();

  return s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: nameInBucket,
      Body: fs.readFileSync(localFile, 'utf8'),
    })
  );
}

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

function getNameInBucket(filename, suffix) {
  return filename.replace(/\.js$/, suffix + '.js');
}

function getLocalFile(filename) {
  return 'dist/' + filename;
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
