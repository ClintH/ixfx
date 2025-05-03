import { build } from 'esbuild';
import pkg from './package.json'  with { type: "json" };

const sharedConfig = {
  entryPoints: ["./index.ts"],
  bundle: true,
  minify: false,
  // only needed if you have dependencies
  //external: Object.keys(dependencies).concat(Object.keys(peerDependencies)),
  //external: Object.keys(pkg.dependencies),
};

build({
  ...sharedConfig,
  platform: 'browser',
  format: 'esm',
  target: 'es2024',
  outfile: "dist-esbuild/index.js",
});
//  pnpx dts-bundle-generator -o dist-esbuild/index.d.ts ./index.ts