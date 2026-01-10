import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [ './src/index.ts', './src/records.ts', './src/maps.ts', './src/trackers.ts', './src/text.ts', './src/continuously.ts', './src/elapsed.ts' ],
  external: [ 'node:module' ],
})
