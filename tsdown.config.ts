import { readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'tsdown/config'

export default defineConfig({
  workspace: 'packages/*',
  entry: [ './src/indexlorp.ts', '!./**.d.ts' ],
  format: 'esm',
  target: 'node2023',
  platform: 'browser',
  watch: !!process.env.DEV,
  dts: { oxc: true },
  clean: true,
  define: {
    'import.meta.DEV': JSON.stringify(!!process.env.DEV),
  },
  unused: {
    level: 'error',
  },
  noExternal: [
    "colorizr"
  ],
  report: false,
  hooks: {
    // "build:before": (ctx) => {
    //   console.log(ctx.options.entry);
    // }
  },
  exports: {
    devExports: 'dev',
    all: false,
    async customExports(exports, { outDir, pkg }) {
      outDir ??= `./dist/`;
      const hasRootDts = (await readdir(path.dirname(outDir))).some((file) =>
        file.endsWith('.d.ts'),
      );
      //console.log(`outDir: ${ outDir } for: ${ pkg.name } hasRoots: ${ hasRootDts }`,);
      if (hasRootDts) {
        //exports[ '.' ] = [ './*', './*.d.ts' ]
        exports[ './*' ] = [ './*', './*.d.ts' ]
      }
      pkg.main = `./dist.index.js`

      return exports
    },
  },
  plugins: [],
})
