/**
 * Coverage ratchet: fails if statement or branch coverage has regressed
 * against the committed baseline (coverage-baseline.json).
 *
 * Baselines are per-package plus an overall total, for statements and
 * branches. Branch coverage is the more meaningful gate: it correlates
 * with assertion strength rather than mere execution.
 *
 * Usage:
 *   pnpm run coverage:check    run vitest coverage, then compare
 *   pnpm run coverage:update   run vitest coverage, then raise baseline
 *
 * Run after `pnpm run test:coverage`, which writes coverage/coverage-summary.json
 * (configured in vitest.config.ts).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), `..`);
const summaryPath = resolve(root, `coverage/coverage-summary.json`);
const baselinePath = resolve(root, `coverage-baseline.json`);
const epsilon = 0.005; // half of the smallest stored precision (2 decimals)

const floor2 = x => Math.floor(x * 100) / 100;

/**
 * @returns {{stmts:number, branch:number}} percentages for a set of files
 */
function pctFor(files) {
  const sum = files.reduce((acc, cov) => ({
    stmtsTotal: acc.stmtsTotal + cov.statements.total,
    stmtsCovered: acc.stmtsCovered + cov.statements.covered,
    branchTotal: acc.branchTotal + cov.branches.total,
    branchCovered: acc.branchCovered + cov.branches.covered,
  }), { stmtsTotal: 0, stmtsCovered: 0, branchTotal: 0, branchCovered: 0 });
  return {
    stmts: sum.stmtsTotal === 0 ? 100 : floor2(sum.stmtsCovered / sum.stmtsTotal * 100),
    branch: sum.branchTotal === 0 ? 100 : floor2(sum.branchCovered / sum.branchTotal * 100),
  };
}

if (!existsSync(summaryPath)) {
  console.error(`Missing ${summaryPath}. Run \`pnpm run test:coverage\` first.`);
  process.exit(2);
}

const summary = JSON.parse(readFileSync(summaryPath, `utf8`));

/** @type {Record<string, ReturnType<typeof pctFor>>} */
const packages = {};
for (const [file, cov] of Object.entries(summary)) {
  if (file === `total`)
    continue;
  const m = file.match(/packages\/([^/]+)\/src\//);
  if (!m)
    continue;
  packages[m[1]] ??= [];
  packages[m[1]].push(cov);
}

const current = {
  total: pctFor([summary.total]),
  packages: Object.fromEntries(
    Object.entries(packages).map(([pkg, files]) => [pkg, pctFor(files)]),
  ),
};

if (process.argv.includes(`--update`)) {
  writeFileSync(baselinePath, `${JSON.stringify(current, null, `  `)}\n`);
  console.log(`Baseline updated: ${baselinePath}`);
  console.log(`  total: stmts ${current.total.stmts}% branch ${current.total.branch}%`);
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  console.error(`Missing ${baselinePath}. Create it with \`pnpm run coverage:update\`.`);
  process.exit(2);
}

const baseline = JSON.parse(readFileSync(baselinePath, `utf8`));

const regressions = [];
function check(label, base, curr) {
  for (const metric of [`stmts`, `branch`]) {
    if (curr[metric] + epsilon < base[metric]) {
      regressions.push(`  ${label}: ${metric} ${curr[metric]}% < baseline ${base[metric]}%`);
    }
  }
}

check(`total`, baseline.total, current.total);
for (const [pkg, base] of Object.entries(baseline.packages)) {
  const curr = current.packages[pkg];
  if (!curr) {
    regressions.push(`  ${pkg}: missing from current report`);
    continue;
  }
  check(pkg, base, curr);
}

if (regressions.length > 0) {
  console.error(`Coverage regression against ${baselinePath}:`);
  console.error(regressions.join(`\n`));
  console.error(`\nFix the regression, or intentionally raise the baseline with \`pnpm run coverage:update\`.`);
  process.exit(1);
}

console.log(`Coverage ratchet OK (total: stmts ${current.total.stmts}% ≥ ${baseline.total.stmts}%, branch ${current.total.branch}% ≥ ${baseline.total.branch}%)`);
