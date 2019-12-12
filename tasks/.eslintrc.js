module.exports = {
  extends: ['../.eslintrc.js'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
    ecmaFeatures: {}
  },
  rules: {
    'no-process-env': 'off',
    'prefer-const': 'warn',
    'compat/compat': 'off',
    'dot-notation': ['error', { allowKeywords: true }]
  }
};
