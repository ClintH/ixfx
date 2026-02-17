# Development

```
pnpm run clean
pnpm run build
pnpm run test
```


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
pnpx vitest run ./packages/flow/tests/retry.test.ts
```

Generate coverage report, outputs to ./coverage
```
pnpm run coverage
```

## Coding conventions

ESLint rules enforce most conventions.

# Verification

Verify packages
```
pnpm run verify
```

```
pnpm run knip
pnpx --yes @arethetypeswrong/cli --format ascii --profile esm-only --pack .
pnpx publint
```

# Publishing

```
pnpm run release
pnpm run publish 
```

## Running a visual test

For example:
```
pnpx vite serve ./tests/io/midi/
```