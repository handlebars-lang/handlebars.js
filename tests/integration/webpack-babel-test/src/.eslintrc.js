/* eslint-env node */
module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  env: {
    browser: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
  },
};
