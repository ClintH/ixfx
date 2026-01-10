import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/easing.ts',
    './src/source.ts',
    './src/envelope.ts'
  ],
  external: [ 'node:module' ],
})
