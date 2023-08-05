const { listFiles } = require('./listFiles');
const { uploadFile } = require('./uploadFile');
const { deleteFile } = require('./deleteFile');
const { S3Client } = require('@aws-sdk/client-s3');
const { requireEnvVar } = require('./requireEnvVar');
const { fetchFile, fileUrl } = require('./fetchFile');

module.exports = { createS3Client };

function createS3Client() {
  // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
  requireEnvVar('AWS_ACCESS_KEY_ID');
  requireEnvVar('AWS_SECRET_ACCESS_KEY');

  const bucket = requireEnvVar('S3_BUCKET_NAME');
  const s3Client = new S3Client({
    region: 'us-east-1'
  });

  return {
    async listFiles() {
      return listFiles(s3Client, bucket);
    },
    async uploadFile(localName, remoteName) {
      await uploadFile(s3Client, bucket, localName, remoteName);
    },
    async deleteFile(remoteName) {
      await deleteFile(s3Client, bucket, remoteName);
    },
    async fetchFile(remoteName) {
      return fetchFile(bucket, remoteName);
    },
    fileUrl(remoteName) {
      return fileUrl(bucket, remoteName);
    }
  };
}
