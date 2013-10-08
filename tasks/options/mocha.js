module.exports = {
  test: {
    src: [
      '/vendor/should.js',
      '/vendor/loader.js',
      '/tmp/tests/all-tests.js',
      '/tmp/tests/helpers.js',
      '/tmp/*.js'
    ],
    options: {
      reporter: 'spec'
    }
  }
};
