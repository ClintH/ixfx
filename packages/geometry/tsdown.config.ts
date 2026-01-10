import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [
    './src/arc/index.ts',
    './src/bezier/index.ts',
    './src/circle/index.ts',
    './src/grid/index.ts',
    './src/line/index.ts',
    './src/path/index.ts',
    './src/point/index.ts',
    './src/polar/index.ts',
    './src/rect/index.ts',
    './src/shape/index.ts',
    './src/triangle/index.ts',
    './src/layout.ts',
    './src/index.ts',
  ],
  external: [ 'node:module' ],
})
