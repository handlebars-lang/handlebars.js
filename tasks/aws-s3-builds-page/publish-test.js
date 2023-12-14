const crypto = require('crypto');
const { publishWithSuffixes } = require('./publish');
const { runTest } = require('./test-utils/runTest');
const { createS3Client } = require('./s3client');
const fs = require('node:fs/promises');

// This is a test file. It is intended to be run manually with the proper environment variables set
//
// Run it from the project root using "node tasks/aws-s3-builds-page/publish-test.js"

const s3Client = createS3Client();

runTest(async ({ log }) => {
  const suffix1 = `-test-file-` + crypto.randomUUID();
  const suffix2 = `-test-file-` + crypto.randomUUID();
  log(`Publish ${suffix1} and ${suffix2}`);
  await publishWithSuffixes([suffix1, suffix2]);
  await compareAndDeleteFiles(suffix1, log);
  await compareAndDeleteFiles(suffix2, log);
});

async function compareAndDeleteFiles(suffix, log) {
  const pairs = [
    ['dist/handlebars.js', `handlebars${suffix}.js`],
    ['dist/handlebars.min.js', `handlebars.min${suffix}.js`],
    ['dist/handlebars.runtime.js', `handlebars.runtime${suffix}.js`],
    ['dist/handlebars.runtime.min.js', `handlebars.runtime.min${suffix}.js`]
  ];
  for (const [localFile, remoteFile] of pairs) {
    await expectSameContents(localFile, remoteFile, log);
    log(`Deleting "${remoteFile}"`);
    await s3Client.deleteFile(remoteFile);
  }
}

async function expectSameContents(localFile, remoteFile, log) {
  log(
    `Checking file contents "${localFile}" vs "${s3Client.fileUrl(remoteFile)}"`
  );
  const remoteContents = await s3Client.fetchFile(remoteFile);
  const localContents = await fs.readFile(localFile, 'utf-8');
  if (remoteContents !== localContents) {
    throw new Error(
      `Files do not match: ${localFile}" vs "${s3Client.fileUrl(remoteFile)}"`
    );
  }
}
