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
