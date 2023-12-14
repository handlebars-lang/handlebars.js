/* eslint-disable no-console */
const { createS3Client } = require('./s3client');

const filenames = [
  'handlebars.js',
  'handlebars.min.js',
  'handlebars.runtime.js',
  'handlebars.runtime.min.js'
];

async function publishWithSuffixes(suffixes) {
  const s3Client = createS3Client();
  const publishPromises = suffixes.map(suffix =>
    publishSuffix(s3Client, suffix)
  );
  return Promise.all(publishPromises);
}

async function publishSuffix(s3client, suffix) {
  const publishPromises = filenames.map(async filename => {
    const nameInBucket = getNameInBucket(filename, suffix);
    const localFile = getLocalFile(filename);
    await s3client.uploadFile(localFile, nameInBucket);
    console.log(`Published ${localFile} to build server (${nameInBucket})`);
  });
  return Promise.all(publishPromises);
}

function getNameInBucket(filename, suffix) {
  return filename.replace(/\.js$/, suffix + '.js');
}

function getLocalFile(filename) {
  return 'dist/' + filename;
}

module.exports = { publishWithSuffixes };
