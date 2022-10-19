module.exports = {
  globals: {
    CompilerContext: true,
    Handlebars: true,
    handlebarsEnv: true,
    shouldCompileTo: true,
    shouldCompileToWithPartials: true,
    shouldThrow: true,
    expectTemplate: true,
    compileWithPartials: true,
    suite: true,
    equal: true,
    equals: true,
    test: true,
    testBoth: true,
    raises: true,
    deepEqual: true,
    start: true,
    stop: true,
    ok: true,
    sinon: true,
    strictEqual: true,
    define: true,
    expect: true,
    chai: true,
  },
  env: {
    mocha: true,
  },
  rules: {
    // Disabling for tests, for now.
    'no-path-concat': 'off',

    'no-var': 'off',
    'dot-notation': 'off',
  },
};
