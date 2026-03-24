#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = Number(process.env.PORT || 9999);
const HOST = process.env.HOST || '127.0.0.1';
const ROOT_DIR = path.resolve(__dirname, '..', '..');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm'
};

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function resolveFilePath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decodedPath).replace(/^([/\\])+/, '');
  let absolutePath = path.resolve(ROOT_DIR, normalized);

  if (
    !absolutePath.startsWith(ROOT_DIR + path.sep) &&
    absolutePath !== ROOT_DIR
  ) {
    return null;
  }

  if (decodedPath.endsWith('/')) {
    absolutePath = path.join(absolutePath, 'index.html');
  }

  return absolutePath;
}

const server = http.createServer(function(req, res) {
  if (!req.url) {
    send(
      res,
      400,
      { 'Content-Type': 'text/plain; charset=utf-8' },
      'Bad Request'
    );
    return;
  }

  const absolutePath = resolveFilePath(req.url);
  if (!absolutePath) {
    send(
      res,
      403,
      { 'Content-Type': 'text/plain; charset=utf-8' },
      'Forbidden'
    );
    return;
  }

  fs.stat(absolutePath, function(statErr, stats) {
    if (statErr) {
      send(
        res,
        404,
        { 'Content-Type': 'text/plain; charset=utf-8' },
        'Not Found'
      );
      return;
    }

    if (stats.isDirectory()) {
      const indexPath = path.join(absolutePath, 'index.html');
      fs.readFile(indexPath, function(indexErr, indexData) {
        if (indexErr) {
          send(
            res,
            404,
            { 'Content-Type': 'text/plain; charset=utf-8' },
            'Not Found'
          );
          return;
        }

        send(
          res,
          200,
          { 'Content-Type': 'text/html; charset=utf-8' },
          indexData
        );
      });
      return;
    }

    fs.readFile(absolutePath, function(readErr, data) {
      if (readErr) {
        send(
          res,
          500,
          { 'Content-Type': 'text/plain; charset=utf-8' },
          'Internal Server Error'
        );
        return;
      }

      const ext = path.extname(absolutePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      send(res, 200, { 'Content-Type': contentType }, data);
    });
  });
});

server.listen(PORT, HOST, function() {
  process.stdout.write(
    'Started static test server on http://' + HOST + ':' + PORT + '\n'
  );
});
