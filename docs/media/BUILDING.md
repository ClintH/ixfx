# Development

## Build scripts

Type-check and compile to `./etc/build/`

```
npm run build
npm run develop // continually rebuild just with tsc
npm run dev     // continually rebuild & bundle with tsup
```

Build Typescript sources, running a single file with source map support. Note
that the path is the intermediate build path, rather than the `./src/` path, and
the `JS` extension is used.

```
npm run run -- ./etc/build/StateMachine.js
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
import { Geometry } from 'ixfx/geometry';
```

If you're working on [demos](https://github.com/ClintH/ixfx-demos), you can
build & copy files, assuming `ixfx-demos` is cloned in the same parent folder as
`ixfx`:

```
npm run demos
```

Once that is done you can use a live server in `ixfx-demos` to run the demos.

Another suggestion is to symlink `ixfx-demos\ixfx` to `ixfx\dist` so the demos
are always using the latest changes to the library.

## Deploying

Cleans and builds for packaging:

```
npm run publish
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
npm run test -- --match="name-of-test"
```

Run a single test file:
```
npx ava --config ./config/ava.config.js ./src/__test/NAME_OF_FILE.ts
```

ESLint report:

```
npm run lint
```

## Coding conventions

ESLint rules enforce most conventions.
