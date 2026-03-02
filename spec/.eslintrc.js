module.exports = {
  globals: {
    CompilerContext: true,
    Handlebars: true,
    handlebarsEnv: true,
    expectTemplate: true,
    suite: true,
    test: true,
    testBoth: true,
    raises: true,
    deepEqual: true,
    start: true,
    stop: true,
    ok: true,
    vi: true,
    strictEqual: true,
    define: true,
    expect: true,
    beforeEach: true,
    afterEach: true,
    describe: true,
    it: true,
  },
  rules: {
    // Disabling for tests, for now.
    'no-path-concat': 'off',

    'no-var': 'off',
    'dot-notation': 'off',
  },
};
