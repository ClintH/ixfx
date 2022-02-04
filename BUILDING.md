# Development

## Build scripts

Typecheck and compile to `./etc/build/`

```
npm run build
npm run develop // continually rebuild
```

Build Typescript sources, running a single file with source map support:
```
npm run run -- build/StateMachine.js
```

## Using a local copy of ixfx

If you're working in other repositories, but want to use live-updated sources:

```
(in ixfx repo)
npm link
npm bundle:watch   // continually rebuilds dist bundle

(in remote repo)
npm link ../ixfx
```

In remote repo, it should be possible to consume the library:
```
import {Geometry} from 'ixfx/lib/geometry';
```

## Deploying

Uses `tsc` and `tsup` to build library and type definitions to `./dist`

```
npm run pkg
```

Publishing to NPM will trigger the same script, but cleaning `./dist` and `./etc` first.

## Docs

Generate API docs to `./docs` so they are picked up by GH pages.

```
npm run docs
npm run docs:watch // Auto-rebuilt as source changes
```


Assuming you have the `ixfx-docs` repository as a sibling directory, you can copy API docs to their right place:

```
npm run copyApiDocs
```

## Testing

The `tests` folder contains Jest unit tests.

Run all tests:
```
npm run test
```

Run a single test:
```
npm run test grid.test.ts
```

Test coverage report:
```
npm run test:coverage
```

ESLint report:

```
npm run lint
```

## Coding conventions

ESLint rules enforce most conventions.
