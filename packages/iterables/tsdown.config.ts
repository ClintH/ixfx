import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [
    './src/sync.ts',
    './src/async.ts',
    './src/index.ts'
  ],
  external: [ 'node:module' ],
})
