/* eslint-disable no-console */
const { createS3Client } = require('../s3client/index');

const s3Client = createS3Client();

function runTest(asyncFn) {
  asyncFn({ log: console.log.bind(console) })
    .finally(detectSurplusFiles)
    .then(() => {
      console.log('DONE');
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

async function detectSurplusFiles() {
  const listing = await s3Client.listFiles();
  let surplusFileDetected = false;
  const testFilesInBucket = listing.filter(name =>
    name.key.includes('test-file')
  );
  for (const { key: filename } of testFilesInBucket) {
    if (process.argv[2] === '--delete-surplus') {
      await s3Client.deleteFile(filename);
    } else {
      console.log(`Detected surplus file "${filename}"`);
      surplusFileDetected = true;
    }
  }
  if (surplusFileDetected) {
    console.log(`run with --delete-surplus to delete surplus files`);
  }
}

module.exports = { runTest };
