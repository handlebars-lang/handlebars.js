module.exports = {
  amd: {
    type: "amd",
    files: [{
      expand: true,
      cwd: 'lib/',
      src: '**/*.js',
      dest: 'tmp'
    }]
  },

  cjs: {
    type: 'cjs',
    src: ["lib/<%= pkg.barename %>.js", "lib/*/**/*.js"],
    dest: "tmp/<%= pkg.barename %>.cjs.js"
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
