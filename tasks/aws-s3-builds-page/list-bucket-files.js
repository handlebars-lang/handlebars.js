const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const bucket = process.env.S3_BUCKET_NAME;

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
  throw new Error(
    'AWS credentials must be present in environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY'
  );
}

const client = new S3Client({
  region: 'us-east-1'
});

async function listBucketFiles() {
  const command = new ListObjectsV2Command({
    Bucket: bucket
  });

  let isTruncated = true;
  const files = [];

  while (isTruncated) {
    const { Contents, IsTruncated, NextContinuationToken } = await client.send(
      command
    );
    files.push(...Contents.map(s3obj => s3obj.Key));
    isTruncated = IsTruncated;
    command.input.ContinuationToken = NextContinuationToken;
  }
  return files
}

module.exports = { listBucketFiles}
