import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [ './src/index.ts', './src/from/index.ts', './src/ops/index.ts' ],
  external: [ 'node:module' ],
})
