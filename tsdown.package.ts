import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './src/index.ts',
  clean: true,
  minify: true,
  noExternal: [ /(.*)/ ],
  outDir: './bundle',
  platform: `browser`,
  dts: {
    eager: false,
    enabled: false,
    compilerOptions: {
      paths: {
        "@ixfx/visual": [ "../packages/visual" ],
        "@ixfx/geometry": [ "../packages/geometry" ],
        "@ixfx/random": [ "../packages/random" ]
      }
    }
  },
  target: 'esnext',
  sourcemap: true,
  format: `esm`,
})