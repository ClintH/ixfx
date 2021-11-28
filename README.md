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

# Credits

Bundles
* Easing functions by [Andrey Sitnik and Ivan Solovev](https://easings.net/)
* [Bezier.js](https://github.com/Pomax/bezierjs)