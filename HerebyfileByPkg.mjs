import { execa } from "execa";
import { task } from "hereby";
import { readdir } from "fs/promises";
import { resolve } from "path";
import { existsSync } from "fs";
import { build as tsupBuild } from 'tsup'
import { deleteSync } from "del";

const demosBaseDir = `../ixfxfun/demos`;
const pkgsSource = `./packages`;
const pkgStaging = `./dist/by-package`;
const byPkgDestRel = `${demosBaseDir}/ixfx`;
const byPkgDestAbs = resolve(byPkgDestRel);

async function* getPackages() {
  if (!existsSync(demosBaseDir)) {
    throw new Error(`Destination path doesn't exist: ${demosBaseDir}`);
  }
  let dirs = (await readdir(`${pkgsSource}/`, { withFileTypes: true }))
    .filter(dir => dir.isDirectory());
  for (const dir of dirs) {
    yield dir;
  }
}

export const build = task({
  name: "build",
  run: async () => {
    await execa("pnpm", ["run", "rebuild"]);
  },
});



export const cleanStaging = task({
  name: "cleanStaging",
  run: async () => {
    deleteSync(`${pkgStaging}/*`);
  }
});

export const cleanDestination = task({
  name: `cleanDestination`,
  run: async () => {
    if (!existsSync(byPkgDestRel)) {
      throw new Error(`Destination does not exist: ${byPkgDestRel}`);
    }
    deleteSync(`${byPkgDestRel}/*`, { force: true });
  }
});

export const bundleByPackage = task({
  name: "bundleByPackage",
  dependencies: [cleanDestination, cleanStaging],
  run: async () => {
    const entry = {}
    for await (const dir of getPackages()) {
      entry[dir.name] = `${pkgsSource}/${dir.name}/src/index.ts`
    }
    await tsupBuild({
      // @ts-ignore
      entry,
      sourcemap: true,
      dts: {
        // resolve: [/(.*)/]
        resolve: !0
      },
      format: `esm`,
      target: `es2022`,
      outDir: `${pkgStaging}/`,
      clean: false,
      noExternal: [/(.*)/],
      platform: `browser`,
      splitting: true,
      silent: false
    })
  }
});
// export const bundleByPackage = task({
//   name: "bundleByPackage",
//   dependencies: [cleanDestination, cleanStaging],
//   run: async () => {
//     console.log(`Bundling packages...`);
//     for await (const dir of getPackages()) {
//       console.log(` - ${dir.name}`);
//       const entry = {}
//       entry[dir.name] = `${pkgsSource}/${dir.name}/src/index.ts`
//       await tsupBuild({
//         // @ts-ignore
//         entry,
//         sourcemap: true,
//         dts: {
//           resolve: [/(.*)/]
//         },
//         format: `esm`,
//         target: `es2024`,
//         outDir: `${pkgStaging}/`,
//         clean: false,
//         noExternal: [/(.*)/],
//         platform: `browser`,
//         splitting: false,
//         silent: true
//       })
//     }
//   }
// });

export const bundleAndCopy = task({
  name: "bundleAndCopy",
  dependencies: [bundleByPackage],
  run: async () => {
    if (!existsSync(byPkgDestRel)) {
      throw new Error(`Destination does not exist: ${byPkgDestRel}`);
    }
    // Copy
    await execa(`cp`, [
      `${pkgStaging}/*`,
      `${byPkgDestRel}/`]);
  },
});

export default bundleAndCopy;