/* eslint-disable no-console */
const { createS3Client } = require('./index');
const crypto = require('crypto');
const { runTest } = require('../test-utils/runTest');

// This is a test file. It is intended to be run manually
// with the proper environment variables set
// It tests whether the upload/list/delete methods in this directory
// work properly.
//
// Run it from the project root using "node tasks/aws-s3-builds-page/s3client/s3-test.js"

const client = createS3Client();

runTest(async ({ log }) => {
  const uuid = crypto.randomUUID();
  const filename = `test-file-${uuid}`;
  log(`Starting test with target file "${filename}"`);

  log(`Uploading "${filename}"`);
  await client.uploadFile('package.json', filename);

  log(`Check if uploaded "${filename}"`);
  const listing = await client.listFiles();
  if (!listing.includes(filename)) {
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

  log(`Delete "${filename}"`);
  await client.deleteFile(filename);

  log(`Check if deleted "${filename}"`);
  const listingAfterDelete = await client.listFiles();
  if (listingAfterDelete.includes(filename)) {
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
