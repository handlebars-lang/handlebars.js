const { ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function listFiles(s3Client, bucket) {
  const command = new ListObjectsV2Command({
    Bucket: bucket
  });

  let isTruncated = true;
  const files = [];

  while (isTruncated) {
    const {
      Contents,
      IsTruncated,
      NextContinuationToken
    } = await s3Client.send(command);
    files.push(...Contents.map(dataFromS3Object));
    isTruncated = IsTruncated;
    command.input.ContinuationToken = NextContinuationToken;
  }
  return files;
}

function dataFromS3Object(s3obj) {
  return {
    key: s3obj.Key,
    size: s3obj.Size,
    lastModified: s3obj.LastModified.toISOString()
  };
}

module.exports = { listFiles };
