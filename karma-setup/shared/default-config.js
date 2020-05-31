module.exports = {
  frameworks: ['mocha'],
  // concurrency: we have no concurrency set, because this seems to let Karma hang after the first batch
  // of browsers have finished their tests.
  reporters: ['dots']
};
