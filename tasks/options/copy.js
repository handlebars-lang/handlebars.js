module.exports = {
  stage: {
    files: [{
      expand: true,
      cwd:    'tmp/',
      src:    ['*.js'],
      dest:   'dist/'
    }]
  }
}
