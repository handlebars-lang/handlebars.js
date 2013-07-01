module.exports = {
  library: {
    src: ['tmp/<%= pkg.barename %>.amd.js'],
    dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.amd.js'
  },

  deps: {
    src: ['vendor/deps/*.js'],
    dest: 'tmp/deps.amd.js'
  },

  browser: {
    src: ['vendor/loader.js', 'tmp/<%= pkg.barename %>.amd.js'],
    dest: 'tmp/<%= pkg.barename %>.browser1.js'
  }
};
