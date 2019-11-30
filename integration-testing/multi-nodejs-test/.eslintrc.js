module.exports = {
  extends: ['eslint:recommended', 'plugin:es5/no-es2015', 'prettier'],
  globals: {
    self: false
  },
  env: {
    node: true
  },
  rules: {
    'no-console': 'off',
    'no-var': 'off'
  }
};
