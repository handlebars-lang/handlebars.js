/* eslint-disable no-console */
const { listFiles, uploadFile, deleteFile } = require('./index');

const crypto = require('crypto');
const uuid = crypto.randomUUID();

const BUCKET_BASE_URL = `https://s3.amazonaws.com/${process.env.S3_BUCKET_NAME}`;

async function run() {
  const filename = `test-file-${uuid}`;
  console.log(`Starting test with target file "${filename}"`);

  console.log(`Uploading "${filename}"`);
  await uploadFile('package.json', filename);

  console.log(`Check if uploaded "${filename}"`);
  const listing = await listFiles();
  if (!listing.includes(filename)) {
    throw new Error(`File "${filename}" has not been uploaded`);
  }

  console.log(`Check contents of "${filename}"`);
  const uploadedContents = await (
    await fetch(BUCKET_BASE_URL + '/' + filename)
  ).text();
  expectStringContains('"name": "handlebars"', uploadedContents);

  console.log(`Delete "${filename}"`);
  await deleteFile(filename);

  console.log(`Check if deleted "${filename}"`);
  const listingAfterDelete = await listFiles();
  if (listingAfterDelete.includes(filename)) {
    throw new Error(`File "${filename}" has not been deleted`);
  }
}

run()
  .finally(logTestFilesInBucket)
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

function expectStringContains(needle, haystack) {
  if (!haystack.includes(needle)) {
    throw new Error(`Expecting to find "${needle}" in string "${haystack}"`);
  }
}

async function logTestFilesInBucket() {
  const listing = await listFiles();
  const testFilesInBucket = listing.filter(name =>
    name.startsWith('test-file-')
  );
  for (const filename of testFilesInBucket) {
    console.log(`Detected surplus file "${filename}"`);
    if (process.argv[2] === '--delete-surplus') {
      await deleteFile(filename);
    } else {
      console.log(`run with --delete-surplus to delete it`);
    }
  }
  console.log('DONE');
}
