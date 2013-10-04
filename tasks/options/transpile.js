var grunt = require('grunt');

module.exports = {
  'handlebars': {
    type: 'amd',
    files: [{
      expand: true,
      cwd:    'lib/',
      src:    '**/*.js',
      dest:   'tmp/'
    }]
  },

  //'handlebars-cjs': {
    //type: 'cjs',
    //files: [{
      //expand: true,
      //cwd:    'lib/',
      //src:    '**/*.js',
      //dest:   'tmp/'
    //}]
  //},

  'tests': {
    type: 'amd',
    files: [{
      expand: true,
      cwd:    'tests/',
      src:    '**/*.js',
      dest:   'tmp/tests/'
    }]
  }
};
