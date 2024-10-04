const crypto = require('crypto');

const { runTest } = require('./test-utils/runTest');
const { createS3Client } = require('./s3client');
const { generateFileList } = require('./generateFileList');
const assert = require('node:assert');

// This is a test file. It is intended to be run manually with the proper environment variables set
//
// Run it from the project root using "node tasks/aws-s3-builds-page/generateFileList-test.js"

const s3Client = createS3Client();

runTest(async ({ log }) => {
  log('Generate file list');
  const filename = `test-file-list-${crypto.randomUUID()}`;
  await generateFileList(filename);

  log(`Checking JSON at ${s3Client.fileUrl(`${filename}.json`)}`);
  const jsonList = JSON.parse(await s3Client.fetchFile(`${filename}.json`));
  assert(jsonList.find(s3obj => s3obj.key === 'handlebars-v4.7.7.js'));

  log(`Checking HTML at ${s3Client.fileUrl(`${filename}.html`)}`);
  const htmlList = await s3Client.fetchFile(`${filename}.html`);
  assert(htmlList.includes('handlebars-v4.7.7.js'));
  assert(htmlList.includes('handlebarsjs.com'));
  assert(!htmlList.includes('index.html'));

  log(`Deleting file ${filename}.json`);
  await s3Client.deleteFile(`${filename}.json`);
});
