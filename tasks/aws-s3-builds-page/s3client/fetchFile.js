async function fetchFile(bucket, remoteName) {
  return (await fetch(fileUrl(bucket, remoteName))).text();
}

function fileUrl(bucket, remoteName) {
  const bucketUrl = `https://s3.amazonaws.com/${bucket}`;
  return `${bucketUrl}/${remoteName}`;
}

module.exports = { fetchFile, fileUrl };
