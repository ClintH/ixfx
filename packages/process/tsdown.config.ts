import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [ './src/index.ts', './src/basic.ts' ],
  external: [ 'node:module' ],
})
