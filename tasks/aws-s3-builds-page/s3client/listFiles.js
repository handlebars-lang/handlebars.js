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
    files.push(...Contents.map(s3obj => s3obj.Key));
    isTruncated = IsTruncated;
    command.input.ContinuationToken = NextContinuationToken;
  }
  return files;
}

module.exports = { listFiles };
