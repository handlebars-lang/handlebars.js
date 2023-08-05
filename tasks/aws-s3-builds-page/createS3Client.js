const { S3Client } = require('@aws-sdk/client-s3');

function requiredEnvVar(name) {
  if (!process.env[name]) {
    throw new Error(`Environment variable "${name}" is required.`);
  }
  return process.env[name];
}

function createS3Client() {
  // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
  requiredEnvVar('AWS_ACCESS_KEY_ID');
  requiredEnvVar('AWS_SECRET_ACCESS_KEY');

  return {
    bucket: requiredEnvVar('S3_BUCKET_NAME'),
    s3Client: new S3Client({
      region: 'us-east-1'
    })
  };
}

module.exports = { createS3Client };
