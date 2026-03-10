import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          include: ['spec/*.js'],
          exclude: ['spec/env/**', 'spec/.eslintrc.js'],
          setupFiles: ['spec/env/node.js'],
          globals: true,
        },
      },
      {
        test: {
          name: 'tasks',
          include: ['tasks/tests/*.test.js'],
          globals: true,
          pool: 'forks',
        },
      },
      {
        test: {
          name: 'rspack',
          include: ['tests/rspack/*.test.js'],
          globals: true,
        },
      },
      {
        test: {
          name: 'browser',
          include: ['spec/*.js'],
          exclude: [
            'spec/env/**',
            'spec/.eslintrc.js',
            'spec/precompiler.js',
            'spec/spec.js',
            'spec/require.js',
            'spec/source-map.js',
          ],
          setupFiles: [
            'spec/env/browser-vitest-pre.js',
            'spec/env/browser-vitest.js',
          ],
          globals: true,
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['dist/cjs/**/*.js'],
      thresholds: {
        // Slightly below 100% because SWC injects helper functions
        // (e.g. _sliced_to_array, _non_iterable_rest) with branches
        // that are unreachable in practice.
        statements: 99,
        branches: 93,
        functions: 100,
        lines: 100,
      },
    },
  },
});
