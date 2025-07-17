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
# make a changeset
pnpm changeset
pnpm changeset version
pnpm publish -r
```
