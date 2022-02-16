# Development

## Build scripts

Type-check and compile to `./etc/build/`

```
npm run build
npm run develop // continually rebuild
```

Build Typescript sources, running a single file with source map support:
```
npm run run -- build/StateMachine.js
```

## Using a local copy of ixfx

If you're working in other repositories, but want to use a local copy of `ixfx`. 

```
(in ixfx repo)
npm link

(in remote repo)
npm link ixfx
```

In remote repo, it should be possible to consume the library:
```
import {Geometry} from 'ixfx/lib/geometry';
```

If you're working on [demos](https://github.com/ClintH/ixfx-demos), you can build & copy files, assuming `ixfx-demos` is cloned in the same parent folder as `ixfx`:

```
npm run demos
```

Another suggestion is to symlink `ixfx-demos\ixfx` to `ixfx\dist` so the demos are always using the latest changes to the library.

## Deploying

Cleans and builds for packaging:

```
npm run publishNpm
npm run publishGh
```

## Docs

Generate API docs to `./docs` so they are picked up by GH pages.

```
npm run docs
npm run docs:watch // Auto-rebuilt as source changes
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
