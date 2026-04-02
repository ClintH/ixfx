import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: [
    `./src/index.ts`,
  ],
  deps: {
    neverBundle: [`node:module`],
    alwaysBundle: [`json5`],
  },
});
