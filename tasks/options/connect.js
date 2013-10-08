var fs  = require('fs'),
    url = require('url');

module.exports = {
  server: {
    options: {
      hostname:   '0.0.0.0',
      port:       8001,
      base:       '.',
      middleware: middleware
    }
  }
};

function middleware(connect, options) {
  return [
    connect['static'](options.base),
    connect.directory(options.base)
  ];
}
