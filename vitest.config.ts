import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '#macros': path.resolve(__dirname, `macros/index.ts`),
    },
    conditions: [`dev`],
  },
  environments: {
    ssr: {
      resolve: { conditions: [`dev`] },
    },
  },
  test: {
    include: [
      `./packages/**/tests/**/*.test.ts`,
    ],
    environment: `happy-dom`,
    coverage: {
      // Vitest only reports files loaded by tests unless `include` is set.
      // Without this, sources never imported by a test are invisible to the
      // report, silently overstating coverage. Keep in sync with ratchet
      // baseline: see scripts/coverage-ratchet.mjs and TESTING-PLAN.md
      include: [`packages/*/src/**/*.ts`],
      exclude: [`**/tests/**`, `**/node_modules/**`],
      reporter: [`text`, `json-summary`],
    },
  },
});
