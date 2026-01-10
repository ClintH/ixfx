import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: [ './src/index.ts', './src/colour/index.ts', "./src/drawing.ts", "./src/svg/index.ts" ],
  //external: [ 'node:module' ],
  noExternal: [ "colorizr" ]
})
