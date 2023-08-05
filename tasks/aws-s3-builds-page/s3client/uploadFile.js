const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('node:fs/promises');

async function uploadFile(s3Client, bucket, localName, remoteName) {
  const fileContents = await fs.readFile(localName);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: remoteName,
    Body: fileContents
  });
  await s3Client.send(command);
}

module.exports = { uploadFile };
