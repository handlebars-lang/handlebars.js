const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('node:fs/promises');

async function uploadFile(
  s3Client,
  bucket,
  localName,
  remoteName,
  { contentType } = {}
) {
  const fileContents = await fs.readFile(localName);
  await uploadData(s3Client, bucket, fileContents, remoteName, { contentType });
}

async function uploadData(
  s3Client,
  bucket,
  data,
  remoteName,
  { contentType } = {}
) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: remoteName,
    Body: data,
    ContentType: contentType
  });
  await s3Client.send(command);
}

module.exports = { uploadFile, uploadData };
