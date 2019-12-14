module.exports = {
  extends: ['eslint:recommended', 'plugin:compat/recommended', 'prettier'],
  globals: {
    self: false
  },
  env: {
    node: true,
    es6: true
  },
  rules: {
    'no-console': 'warn',

    // temporarily disabled until the violating places are fixed.
    'no-func-assign': 'off',
    'no-sparse-arrays': 'off',

    // Best Practices //
    //----------------//
    'default-case': 'warn',
    'guard-for-in': 'warn',
    'no-alert': 'error',
    'no-caller': 'error',
    'no-div-regex': 'warn',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-multi-str': 'warn',
    'no-global-assign': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-process-env': 'error',
    'no-proto': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unused-expressions': 'error',
    'no-warning-comments': 'warn',
    'no-with': 'error',
    radix: 'error',

    // Variables //
    //-----------//
    'no-label-var': 'error',
    'no-undef-init': 'error',
    'no-use-before-define': ['error', 'nofunc'],

    // ECMAScript 6 //
    //--------------//
    'no-var': 'error'
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
    ecmaFeatures: {}
  }
};
