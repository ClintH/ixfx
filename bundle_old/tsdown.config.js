import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: ['./src/index.ts'],
  //external: ['node:module'],
  //noExternal: ['@ixfx/guards', '@ixfx/random']
  minify: true,
  noExternal: [
    /^@ixfx\/.*/,
  ],
})
