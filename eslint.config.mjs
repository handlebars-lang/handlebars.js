import compat from 'eslint-plugin-compat';

export default [
  {
    // Ignore everything except lib/
    ignores: ['**', '!lib/**'],
  },
  {
    // Only check browser API compat in the runtime library code.
    // All other linting is handled by oxlint.
    ...compat.configs['flat/recommended'],
    files: ['lib/**/*.js'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
];
