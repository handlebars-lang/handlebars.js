const { createS3Client } = require('./createS3Client');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

async function deleteFile(name) {
  const { s3Client, bucket } = createS3Client();
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: name
  });
  await s3Client.send(command);
}

module.exports = { deleteFile };
