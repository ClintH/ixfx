import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsdown'

const dir = path.dirname(fileURLToPath(import.meta.url))

const entry = {
  index: './src/index.ts',
  arrays: './src/arrays.ts',
  collections: './src/collections.ts',
  core: './src/core.ts',
  debug: './src/debug.ts',
  dom: './src/dom.ts',
  easings: './src/easings.ts',
  events: './src/events.ts',
  flow: './src/flow.ts',
  guards: './src/guards.ts',
  geometry: './src/geometry.ts',
  iterables: './src/iterables.ts',
  io: './src/io.ts',
  modulation: './src/modulation.ts',
  numbers: './src/numbers.ts',
  process: './src/process.ts',
  random: './src/random.ts',
  rx: './src/rx.ts',
  trackers: './src/trackers.ts',
  ui: './src/ui.ts',
  visual: './src/visual.ts'
}

export default defineConfig({
  entry,
  clean: true,
  platform: `browser`,
  sourcemap: true,
  outDir: `../../ixfxfun/demos/ixfx`,
  format: ['esm'],
  dts: {
    resolve: !0
  },
  // dts: {
  //   isolatedDeclaration: true,
  //   resolve: !0
  // },
  treeshake: true,

})