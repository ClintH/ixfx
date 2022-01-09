# Development

# Build scripts

Clean dist folder, build Typescript sources and bundle into dist/bundle.mjs
```
npm run build
``` 

Continually rebuild and bundle Typescript sources into dist/bundle.mjs:
```
npm run develop
```

Build Typescript sources, running a single file with source map support:
```
npm run run -- build/StateMachine.js
```

# Demos

`demos` folder contains demos and quasi-tests, runnable in the browser. Snowpack is used to build the demos and run a dev server.

Run live-updating dev server
```
npm run dev:demos
```

Build demos
```
npm run build:demos
```

# Testing

The `tests` folder contains Jest unit tests.

Run all tests:
```
npm run test
```

Run a single test:
```
npx jest .\tests\geometry\grid.test.ts
```

Test coverage report:
```
npm run test:coverage
```