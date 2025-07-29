import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './packages/bundle/src/index.ts',
  outDir: './packages/bundle/dist',
  platform: `browser`,
  dts: true,
  format: `esm`,
})