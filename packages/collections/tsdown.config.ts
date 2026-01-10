import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [
    './src/graph/index.ts',
    './src/map/index.ts',
    './src/set/index.ts',
    './src/queue/index.ts',
    './src/stack/index.ts',
    './src/tree/index.ts',
    './src/index.ts'
  ],
  external: [ 'node:module' ],
})
