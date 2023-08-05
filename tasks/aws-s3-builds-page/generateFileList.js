/* eslint-disable no-console */
const { createS3Client } = require('./s3client');
const Handlebars = require('../..');
const fs = require('node:fs/promises');
const path = require('path');

async function generateFileList(nameWithoutExtension) {
  const s3Client = createS3Client();
  const fileList = await s3Client.listFiles();
  const relevantFiles = fileList.filter(s3obj => s3obj.key.endsWith('.js'));

  await uploadJson(s3Client, relevantFiles, nameWithoutExtension);
  await uploadHtml(s3Client, relevantFiles, nameWithoutExtension);
}

async function uploadJson(s3Client, fileList, nameWithoutExtension) {
  const fileListJson = JSON.stringify(fileList, null, 2);
  await s3Client.uploadData(fileListJson, nameWithoutExtension + '.json', {
    contentType: 'application/json'
  });
}

async function uploadHtml(s3Client, fileList, nameWithoutExtension) {
  const templateStr = await fs.readFile(
    path.join(__dirname, 'fileList.hbs'),
    'utf-8'
  );
  const template = Handlebars.compile(templateStr);
  Handlebars.registerHelper('json', obj => JSON.stringify(obj));
  const fileListHtml = template({
    fileList,
    jsonListUrl: nameWithoutExtension + '.json'
  });
  await s3Client.uploadData(fileListHtml, nameWithoutExtension + '.html', {
    contentType: 'text/html'
  });
}

module.exports = { generateFileList };
