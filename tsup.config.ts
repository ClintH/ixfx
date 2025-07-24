import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    arrays: './packages/arrays/src/index.ts',
    collections: './packages/collections/src/index.ts',
    core: './packages/core/src/index.ts',
    debug: './packages/debug/src/index.ts',
    dom: './packages/dom/src/index.ts',
    events: './packages/events/src/index.ts',
    flow: './packages/flow/src/index.ts',
    guards: './packages/guards/src/index.ts',
    geometry: './packages/geometry/src/index.ts',
    iterables: './packages/iterables/src/index.ts',
    io: './packages/io/src/index.ts',
    modulation: './packages/modulation/src/index.ts',
    numbers: './packages/numbers/src/index.ts',
    process: './packages/process/src/index.ts',
    random: './packages/random/src/index.ts',
    rx: './packages/rx/src/index.ts',
    trackers: './packages/trackers/src/index.ts',
    ui: './packages/ui/src/index.ts',
    visual: './packages/visual/src/index.ts'
  },
  outDir: './bundle-tsup',
  format: 'esm',
  target: 'es2024',
  clean: true,
  experimentalDts: true,
  noExternal: [ /(.*)/ ],
})
