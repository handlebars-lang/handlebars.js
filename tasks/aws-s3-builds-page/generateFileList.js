/* eslint-disable no-console */
const { createS3Client } = require('./s3client');

async function generateFileList(nameWithoutExtension) {
  const s3Client = createS3Client();
  const fileList = await s3Client.listFiles();
  const fileListJson = JSON.stringify(fileList, null, 2);
  await s3Client.uploadData(fileListJson, nameWithoutExtension + '.json', {
    contentType: 'application/json'
  });
}

module.exports = { generateFileList };
