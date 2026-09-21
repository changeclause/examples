import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatSummary } from './report.mjs';
const input = {
  report: { status: 'DRIFT', results: [{ id: 'no-auth-boundary', status: 'DRIFT', message: 'Forbidden fact observed in head.' }] },
  tests: { numPassedTests: 3, numTotalTests: 3 },
  testExit: 0, verificationExit: 1, head: 'abc', base: 'def', expected: 'DRIFT',
};
test('shows passing behavior tests alongside an actual failing contract', () => {
  const summary = formatSummary(input);
  assert.match(summary, /3\/3 passed, exit 0/);
  assert.match(summary, /DRIFT, exit 1/);
  assert.match(summary, /intentionally remains red/);
  assert.match(summary, /no-auth-boundary/);
});
test('reports actual unexpected results instead of replacing them with the expectation', () => {
  const summary = formatSummary({ ...input, expected: 'PASS' });
  assert.match(summary, /\| ChangeClause contract \| PASS \| DRIFT, exit 1 \|/);
});
test('escapes report text so it cannot add table rows or HTML', () => {
  const summary = formatSummary({ ...input, report: { status: 'UNKNOWN', results: [{ id: '<script>|x', status: 'UNKNOWN', message: 'a\nb`c' }] } });
  assert.ok(!summary.includes('<script>'));
  assert.match(summary, /&lt;script&gt;&#124;x/);
  assert.match(summary, /a b&#96;c/);
});
