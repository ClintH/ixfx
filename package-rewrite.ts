
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The package.json files use a hack to allow for type lookups without compiling in the 'exports' field.
 * This is not legal, so the 'publishConfig' branch is used to override these when publishing.
 * 
 * tsdown doesn't use the 'publishConfig' and gets confused by the raw exports. So this script
 * will either:
 * * strip the 'publishConfig' part and make all exports point to JS files, or 
 * * add the 'publishConfig' part and make all exports point to TS files
 */
const f = await readdir("./packages", { recursive: true, withFileTypes: true });

const stripPublishConfig = process.argv[ 2 ] === 'strip';
const addPublishConfig = process.argv[ 2 ] === 'add';
const dryRun = false;

if (!stripPublishConfig && !addPublishConfig) {
  console.error(`Needs 'strip' or 'add' parameter`);
  process.exit();
}

type ExportChunk = {
  types: string,
  import: string
}

const getFilename = (s: string) => {
  const slash = s.lastIndexOf("/");
  if (slash < 0) throw new Error(`Missing a /. Input: ${ s }`);
  return s.substring(slash + 1);
}

const destinationPackage = (relativePath: string) => {
  if (!dryRun) {
    return relativePath;
  }
  const mode = stripPublishConfig ? `strip` : `add`;
  return `${ removeExtension(relativePath) }.${ mode }.json`;
}

const removeExtension = (s: string, andNext = false) => {
  const lastDot = s.lastIndexOf(`.`);
  if (lastDot < 0) throw new Error(`No extension? Input: ${ s }`);
  const name = s.substring(0, lastDot);
  if (andNext && name.includes(`.`)) {
    return removeExtension(name, false);
  } else {
    return name;
  }
}

const checkChunk = (chunk: ExportChunk) => {
  if (chunk.import.startsWith(`./src/`) && chunk.types.startsWith('./src/')) {
    // Appears to be fake
    if (chunk.types.endsWith(`.d.ts`)) throw new Error(`Types path starts with ./src/ but also ends with .d.ts. Input: ${ chunk.types }`);
    if (!chunk.import.endsWith(`.ts`)) throw new Error(`Types path starts with ./src/ but does not end with '.ts' Input: ${ chunk.import }`);
    return `fake`;
  }
  if (chunk.import.startsWith(`./dist/src/`) && chunk.types.startsWith('./dist/src/')) {
    if (!chunk.types.endsWith(`.d.ts`)) throw new Error(`Types path starts with ./dist/src/ but does not end in '.d.ts.' Input: ${ chunk.types }`);
    if (!chunk.import.endsWith(`.js`)) throw new Error(`Import path starts with ./dist/src/ but does not end in '.js'. Input: ${ chunk.import }`);
    return `real`
  }
  throw new Error(`Unknown format`)
}

/**
     ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    }
      
    to:

    ".": {
        "types": "./dist/src/index.d.ts",
        "import": "./dist/src/index.js"
      },
  */
const makeChunkReal = (chunk: ExportChunk): ExportChunk => {
  const c = checkChunk(chunk);
  if (c === `real`) return chunk;

  // Remove '.' at beginning
  let typePath = chunk.types.substring(1);
  let importPath = chunk.import.substring(1);

  // Make into ./dist/src/...
  typePath = `./dist${ removeExtension(typePath) }.d.ts`;
  importPath = `./dist${ removeExtension(importPath) }.js`;

  return {
    types: typePath,
    import: importPath
  }
}

/**
 * 
    ".": {
        "types": "./dist/src/index.d.ts",
        "import": "./dist/src/index.js"
      },

      to 

     ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    }
      
  */
const makeChunkFake = (chunk: ExportChunk): ExportChunk => {
  const c = checkChunk(chunk);
  if (c === `fake`) return chunk;

  // Remove './dist' at beginning
  let typePath = chunk.types.substring(6);
  let importPath = chunk.import.substring(6);

  // Make into ./src/...
  typePath = `.${ removeExtension(typePath, true) }.ts`;
  importPath = `.${ removeExtension(importPath) }.ts`;

  return {
    types: typePath,
    import: importPath
  }
}

for (const file of f) {
  if (file.name === `package.json`) {
    const relativePath = join(file.parentPath, file.name);
    console.log(`Path: ${ file.parentPath }`);
    let data = JSON.parse(await readFile(relativePath, { encoding: "utf8" }));

    const hasPublishConfig = typeof data.publishConfig !== `undefined`;
    if (stripPublishConfig) {
      if (hasPublishConfig) {
        console.log(` - strip: has publishConfig to remove`);
        delete data.exports;
        const changed = { ...data, ...data.publishConfig };
        delete changed.publishConfig;
        await writeFile(destinationPackage(relativePath), JSON.stringify(changed, null, "\t"), { encoding: "utf8" })
      } else {
        console.log(` - strip: no publishConfig`);
      }
    }
    if (addPublishConfig) {
      if (hasPublishConfig) {
        //console.log(` - add: already has publishConfig`);
      } else {
        console.log(` - add: has no publishConfig and needs adding`)
        const publishConfig = {
          main: "dist/src/index.js",
          exports: {}
        }

        // Make ./dist/src versions for publishConfig.exports
        for (const [ key, value ] of Object.entries(data.exports)) {
          const chunk = value as ExportChunk;
          publishConfig.exports[ key ] = makeChunkReal(chunk);
        }

        // Change existing exports
        delete data.main;
        for (const [ key, value ] of Object.entries(data.exports)) {
          const chunk = value as ExportChunk;
          data.exports[ key ] = makeChunkFake(chunk);
        }

        const changed = { ...data, publishConfig }
        await writeFile(destinationPackage(relativePath), JSON.stringify(changed, null, "\t"), { encoding: "utf8" })
      }
    }
  }
}
