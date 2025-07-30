import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './src/index.ts',
  clean: true,
  minify: true,
  noExternal: [ /(.*)/ ],
  outDir: './bundle',
  platform: `browser`,
  dts: true,
  silent: false,
  target: 'esnext',
  sourcemap: true,
  format: `esm`,
})