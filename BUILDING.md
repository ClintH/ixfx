# Development

```
pnpm run clean
pnpm run build
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

## Testing

Run all tests:

```
pnpm run test
```

Run a single test:

```
npx vitest run packages/flow/__tests__/retry.test.ts
```

## Coding conventions

ESLint rules enforce most conventions.

# Verification

Verify packages
```
pnpm run publint
```

```
npm run knip
npx --yes @arethetypeswrong/cli --format ascii --profile esm-only --pack .
npx publint
```

# Publishing

```
pnpm changeset version
pnpm install
pnpm publish -r
```
