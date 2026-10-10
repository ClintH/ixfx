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
pnpx vitest run ./packages/collections/tests/tree/tree-pathed.test.ts --environment=node
```

Generate coverage report, outputs to ./coverage
```
pnpm run test:coverage
```

Check coverage has not regressed against the ratchet baseline (see TESTING-PLAN.md):
```
pnpm run coverage:check
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
pnpm run verify
pnpm run release
pnpm run bundle:publish
```

## Running a demo

Manual browser demos/harnesses live in `./demos` (unit tests live in `packages/*/tests`). For example:
```
pnpx vite serve ./demos/io/midi/
```