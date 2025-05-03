import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    bundle: `./packages/geometry/index.ts`,
  },
  dts: true,
  outDir: `./bundle-tsup-geo/`,
  experimentalDts: false,
  sourcemap: true,
  noExternal: [ `@ixfx/arrays`, `bezier-js`, `colorjs.io`, `json5`, `lit-html` ],
  //noExternal: [ `@ixfx/arrays`, `bezier-js`, `colorjs.io`, `json5`, `lit-html` ],
  platform: `browser`,
  target: `es2022`,
  format: [
    `esm`
  ]
});