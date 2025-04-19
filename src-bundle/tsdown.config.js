import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsdown'

const dir = path.dirname(fileURLToPath(import.meta.url))

const entry = {
  index: './src/index.ts',
  // dom: './src/dom.ts',
  // geometry: './src/geometry.ts',
  // modulation: './src/modulation.ts',
  // numbers: './src/numbers.ts',
  // rx: './src/rx.ts',
  // visual: './src/visual.ts'
}

export default defineConfig({
  entry,
  clean: true,
  noExternal: [
    `@ixfxfun/core`,
    `@ixfxfun/dom`,
    `@ixfxfun/geometry`,
    `@ixfxfun/modulation`,
    `@ixfxfun/numbers`,
    `@ixfxfun/rx`,
    `@ixfxfun/visual`
  ],
  platform: `browser`,
  sourcemap: true,
  outDir: `./tsdown`,
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