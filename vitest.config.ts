import path from 'node:path'
import process from 'node:process'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#macros': path.resolve(__dirname, 'macros/index.ts'),
    },
    conditions: [ 'dev' ],
  },
  environments: {
    ssr: {
      resolve: { conditions: [ 'dev' ] },
    },
  },
  test: {
    reporters: process.env.GITHUB_ACTIONS ? [ 'dot', 'github-actions' ] : [ 'dot' ],
    projects: [
      {
        test: {
          name: 'default',
          exclude: ['packages/dom/tests/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'dom',
          include: ['packages/dom/tests/**/*.test.ts'],
          environment: 'happy-dom',
        },
      },
    ],
  },
  plugins: [],
})
