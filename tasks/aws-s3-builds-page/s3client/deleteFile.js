const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

async function deleteFile(s3Client, bucket, remoteName) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: remoteName
  });
  await s3Client.send(command);
}

module.exports = { deleteFile };
