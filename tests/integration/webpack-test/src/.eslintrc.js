module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
  },
};
