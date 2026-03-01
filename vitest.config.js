import { defineConfig } from 'vitest/config';

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
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['dist/cjs/**/*.js'],
      thresholds: {
        statements: 99,
        branches: 93,
        functions: 100,
        lines: 99,
      },
    },
  },
});
