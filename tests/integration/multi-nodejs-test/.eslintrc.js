module.exports = {
  extends: ['eslint:recommended', 'prettier'],
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
