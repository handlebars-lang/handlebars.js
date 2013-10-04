module.exports = {
  library: {
    src: ['tmp/<%= pkg.barename %>.amd.js', 'tmp/<%= pkg.barename %>/**/*.js'],
    dest: 'dist/<%= pkg.barename %>-<%= pkg.version %>.amd.js'
  },

  node: {
    src: ['tmp/<%= pkg.barename %>.cjs.js', 'tmp/<%= pkg.barename %>/**/*.js'],
    dest: 'dist/<%= pkg.barename %>-<%= pkg.version %>.cjs.js'
  },

  browser: {
    src: ['vendor/loader.js', 'dist/<%= pkg.barename %>-<%= pkg.version %>.amd.js'],
    dest: 'tmp/<%= pkg.barename %>.browser.js'
  },

  tests: {
    src: ['tmp/tests/helpers.js', 'tmp/tests/spec/*.js'],
    dest: 'tmp/tests/all-tests.js'
  }
};
