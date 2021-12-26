# ix

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


# Testing

The `tests` folder contains Jest unit tests and manual tests. Manual tests are some HTML+JS to use the code and rely on the library being built. Manual tests are built to the `build-tests` folder.

To start a dev server:
```
npm run develop-tests
```

Unit tests:

```
npm run tests

// Or to run a single test:
npx jest .\tests\geometry\grid.test.ts
```

# Credits

Bundles
* Easing functions by [Andrey Sitnik and Ivan Solovev](https://easings.net/)
* [Bezier.js](https://github.com/Pomax/bezierjs)