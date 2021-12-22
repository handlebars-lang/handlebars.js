const fs = require('fs');
const http = require('http');
const path = require('path');

const mimeTypes = {
  css: 'text/css',
  html: 'text/html',
  js: 'text/javascript',
  json: 'application/json'
};

// Serve static files for spec tests
http
  .createServer(function(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = `${path.resolve(__dirname, '..')}${url.pathname}`;

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath += filePath.endsWith('/') ? '' : '/';
      filePath += 'index.html';
    }

    fs.readFile(filePath, function(err, data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }

      let mimeType = mimeTypes[filePath.split('.').pop()] || 'text/plain';

      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    });
  })
  .listen(3000);
