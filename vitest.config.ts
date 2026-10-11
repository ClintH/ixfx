import path from 'node:path';

import { defineConfig } from 'vitest/config';

// Shared project options. NB: `resolve` is a project-level Vite option (it
// must sit next to `test`, not inside it) — if it is omitted, workspace
// packages resolve to dist/ instead of src/, which corrupts coverage and
// bypasses the dev condition. Keep both projects in sync.
// Alias workspace packages to their source entry points. This is REQUIRED
// in `projects` mode: dependencies would otherwise externalize and resolve
// via package exports to dist/, which breaks the dev condition and stops
// coverage from being attributed to src files.
const packageNames = [
  `arrays`,
  `collections`,
  `core`,
  `debug`,
  `dom`,
  `events`,
  `flow`,
  `geometry`,
  `guards`,
  `io`,
  `iterables`,
  `modulation`,
  `numbers`,
  `process`,
  `random`,
  `rx`,
  `trackers`,
  `ui`,
  `visual`,
];
const aliasShared = {
  // Map to the src DIRECTORY (not index.ts) so subpath imports like
  // `@ixfx/core/maps` resolve to src/maps.ts as well
  ...Object.fromEntries(packageNames.map(p => [
    `@ixfx/${p}`,
    path.resolve(__dirname, `packages/${p}/src`),
  ])),
  '#macros': path.resolve(__dirname, `macros/index.ts`),
};

const resolveShared = {
  alias: aliasShared,
  conditions: [`dev`],
};

// Keep in sync with the ratchet baseline: see scripts/coverage-ratchet.mjs
// and TESTING-PLAN.md
const coverageShared = {
  // Vitest only reports files loaded by tests unless `include` is set.
  // Without this, sources never imported by a test are invisible to the
  // report, silently overstating coverage.
  include: [`packages/*/src/**/*.ts`],
  exclude: [`**/tests/**`, `**/node_modules/**`],
  reporter: [`text`, `json-summary`],
};

export default defineConfig({
  environments: {
    ssr: {
      resolve: { conditions: [`dev`] },
    },
  },
  test: {
    coverage: coverageShared,
    // Two projects: pure-logic suites run in plain node (faster startup than
    // a browser-sim environment), only suites needing a DOM run happy-dom.
    // Add files to the `dom` project if they use document/navigator/window.
    projects: [
      {
        resolve: resolveShared,
        test: {
          name: `dom`,
          environment: `happy-dom`,
          include: [
            `packages/dom/tests/**/*.test.ts`,
            `packages/core/tests/platform.test.ts`,
            // Uses document.querySelector
            `packages/rx/tests/from/event.test.ts`,
          ],
          coverage: coverageShared,
        },
      },
      {
        resolve: resolveShared,
        test: {
          name: `node`,
          environment: `node`,
          include: [`packages/*/tests/**/*.test.ts`],
          exclude: [
            `packages/dom/tests/**`,
            `packages/core/tests/platform.test.ts`,
            `packages/rx/tests/from/event.test.ts`,
          ],
          coverage: coverageShared,
        },
      },
    ],
  },
});
