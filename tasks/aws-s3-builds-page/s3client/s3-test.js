/* eslint-disable no-console */
const { createS3Client } = require('./index');
const crypto = require('crypto');
const { runTest } = require('../test-utils/runTest');
const assert = require('node:assert');

// This is a test file. It is intended to be run manually
// with the proper environment variables set
// It tests whether the upload/list/delete methods in this directory
// work properly.
//
// Run it from the project root using "node tasks/aws-s3-builds-page/s3client/s3-test.js"

const client = createS3Client();

const ISO_DATE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

runTest(async ({ log }) => {
  const uuid = crypto.randomUUID();
  const filename = `test-file-${uuid}`;
  log(`Starting test with target file "${filename}"`);

  log(`Uploading "${filename}"`);
  await client.uploadFile('package.json', filename);

  log(`Check if uploaded "${filename}"`);
  const listing = await client.listFiles();
  if (!listing.find(s3obj => s3obj.key === filename)) {
    throw new Error(`File "${filename}" has not been uploaded`);
  }

  log(`Check contents of "${filename}"`);
  const uploadedContents = await client.fetchFile(filename);
  expectStringContains('"name": "handlebars"', uploadedContents);
  await expectContentType(filename, 'application/octet-stream');

  log(`Uploading with content type "${filename}"`);
  await client.uploadFile('package.json', filename, {
    contentType: 'text/html'
  });
  log('Checking content-type');
  await expectContentType(filename, 'text/html');

  log('Upload data as text/plain');
  await client.uploadData('Hello world', filename, {
    contentType: 'text/plain'
  });
  log('Checking content-type');
  await expectContentType(filename, 'text/plain');
  log(`Check contents of "${filename}"`);
  expectStringContains('Hello world', await client.fetchFile(filename));
  const helloWorldObj = (await client.listFiles()).find(
    s3obj => s3obj.key === filename
  );
  assert.equal(helloWorldObj.size, 11, 'Checking file size of hello world');
  assert.match(
    helloWorldObj.lastModified,
    ISO_DATE,
    'Last modified must be an iso-date'
  );

  log(`Delete "${filename}"`);
  await client.deleteFile(filename);

  log(`Check if deleted "${filename}"`);
  const foundFile = (await client.listFiles()).find(
    s3obj => s3obj.key === filename
  );
  if (foundFile != null) {
    throw new Error(`File "${filename}" has not been deleted`);
  }
});

function expectStringContains(needle, haystack) {
  if (!haystack.includes(needle)) {
    throw new Error(`Expecting to find "${needle}" in string "${haystack}"`);
  }
}

async function expectContentType(remoteName, expectedContentType) {
  const contentType = (await fetch(client.fileUrl(remoteName))).headers.get(
    'Content-Type'
  );
  if (contentType !== expectedContentType) {
    throw new Error(
      `Expecting to find content-type "${expectedContentType}" but found "${contentType}"`
    );
  }
}
