import { defineConfig } from '@rslib/core';

export default defineConfig({
  output: {
    target: `web`,
    distPath: { root: `./dist-rslib` },
    minify: {
      jsOptions: {
        minimizerOptions: {
          compress: false,
          mangle: false,
          minify: false,
          format: {
            comments: `all`
          }
        }
      }
    }
  },
  source: {
    entry: {
      bundle: './src/rx.ts'
    }
  },
  lib: [
    {
      format: 'esm',
      syntax: 'es2024',
      dts: {
        distPath: './dist-path',
        bundle: false,
        build: true
      }
    }
  ]
});