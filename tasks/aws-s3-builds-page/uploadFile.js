const { createS3Client } = require('./createS3Client');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('node:fs/promises');

async function uploadFile(localName, targetName) {
  const { s3Client, bucket } = createS3Client();
  const fileContents = await fs.readFile(localName);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: targetName,
    Body: fileContents
  });
  await s3Client.send(command);
}

module.exports = { uploadFile };
