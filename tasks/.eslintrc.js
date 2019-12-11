module.exports = {
  extends: ['../.eslintrc.js'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
    ecmaFeatures: {}
  },
  rules: {
    'no-process-env': 'off',
    'prefer-const': 'warn'
  }
};
