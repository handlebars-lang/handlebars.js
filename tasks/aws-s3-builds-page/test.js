const { listBucketFiles } = require('./index');

const main = async () => {
  console.log(await listBucketFiles());
};

main().catch(console.error);
