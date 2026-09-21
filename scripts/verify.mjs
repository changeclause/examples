// Run only after inspecting this synthetic example and installing its dependencies.
// Tests execute explicitly here. ChangeClause review/verify do not execute target code.
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const toolRoot = process.argv[2] && path.resolve(process.argv[2]);
if (!toolRoot) throw new Error('Usage: pnpm verify /absolute/path/to/built/changeclause');
const cli = path.join(toolRoot, 'packages/cli/dist/index.js');
const artifacts = mkdtempSync(path.join(tmpdir(), 'changeclause-pr-example-'));
const base = execFileSync('git', ['merge-base', 'main', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim())
  throw new Error('Commit changes first: this example requires a clean worktree.');
const contractPath = '.changeclause/newsletter.yaml';
const approved = path.join(artifacts, 'approved.yaml'), candidate = path.join(artifacts, 'candidate.yaml');
writeFileSync(approved, execFileSync('git', ['show', `${base}:${contractPath}`], { cwd: root }));
writeFileSync(candidate, execFileSync('git', ['show', `HEAD:${contractPath}`], { cwd: root }));
const manifest = path.join(artifacts, 'manifest.json'), testReport = path.join(artifacts, 'vitest.json'), evidence = path.join(artifacts, 'evidence.json');
const runner = path.join(root, 'node_modules/vitest/vitest.mjs');
const version = JSON.parse(readFileSync(path.join(root, 'node_modules/vitest/package.json'), 'utf8')).version;
function run(file, args, allowed = [0]) {
  const result = spawnSync(process.execPath, [file, ...args], { cwd: root, encoding: 'utf8', timeout: 120000 });
  if (result.error || !allowed.includes(result.status)) throw new Error(`${result.error || result.stderr}\n${result.stdout}`);
  return result;
}
run(cli, ['evidence', 'prepare', '--project', root, '--contract', approved, '--runner-version', version, '--out', manifest]);
const tested = run(runner, ['run', '--retry=0', '--reporter=json', `--outputFile=${testReport}`], [0, 1]);
run(cli, ['evidence', 'import-vitest', '--manifest', manifest, '--report', testReport, '--out', evidence]);
const verified = run(cli, ['verify', '--repo', root, '--base', base, '--head', 'HEAD', '--comparison', 'pr', '--contract', candidate, '--approved-contract', approved, '--evidence', evidence, '--json'], [0, 1, 2]);
writeFileSync(path.join(artifacts, 'verification.json'), verified.stdout);
const report = JSON.parse(verified.stdout);
console.log(`${report.status} — behavior test exit ${tested.status}, verification exit ${verified.status}`);
for (const clause of report.results) console.log(`${clause.status.padEnd(10)} ${clause.id}: ${clause.message}`);
console.log(`Full artifacts: ${artifacts}`);
// DRIFT/INCOMPLETE are demonstration outcomes, not successful verification.
process.exitCode = verified.status || tested.status;
