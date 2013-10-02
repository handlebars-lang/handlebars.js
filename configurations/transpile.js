module.exports = {
  amd: {
    type: "amd",
    files: [{
      expand: true,
      cwd: 'lib/',
      src: '**/!(index).js',
      dest: 'dist/amd/'
    }]
  },

  cjs: {
    type: 'cjs',
    files: [{
      expand: true,
      cwd: 'lib/',
      src: '**/!(index).js',
      dest: 'dist/cjs/'
    }]
  },

  globals: {
    type: 'globals',
    src: ["lib/<%= pkg.barename %>.js", "lib/*/**/*.js"],
    dest: "tmp/<%= pkg.barename %>.globals.js"
  },

  tests: {
    type: 'amd',
    src: ['test/test_helpers.js', 'test/tests.js', 'test/tests/**/*_test.js'],
    dest: 'tmp/tests.amd.js'
  }
};
