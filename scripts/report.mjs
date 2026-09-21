const cell = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '&#124;').replaceAll('`', '&#96;').replace(/[\r\n]/g, ' ');

export function formatSummary({ report, tests, testExit, verificationExit, head, base, expected }) {
  const lines = [
    `## ChangeClause result: ${cell(report.status)}`,
    '',
    `Head: \`${cell(head)}\` · Approved baseline: \`${cell(base)}\``,
    '',
    '| Check | Expected for this demonstration | Observed |',
    '| --- | --- | --- |',
    `| Behavior tests | ${expected ? '3 passed, exit 0' : 'See the PR contract'} | ${tests.numPassedTests}/${tests.numTotalTests} passed, exit ${testExit} |`,
    `| ChangeClause contract | ${cell(expected ?? 'Not specified')} | ${cell(report.status)}, exit ${verificationExit} |`,
    '',
    '| Clause | Result | Explanation |',
    '| --- | --- | --- |',
    ...report.results.map((result) => `| ${cell(result.id)} | ${cell(result.status)} | ${cell(result.message)} |`),
    '',
    expected === 'DRIFT'
      ? 'This example is expected to expose a forbidden authentication dependency. The contract check intentionally remains red when verification returns DRIFT; passing behavior tests do not override it.'
      : 'PASS covers the declared supported obligations. Missing or unsupported evidence still requires review.',
    '',
    'Test evidence is locally self-attested; running in GitHub Actions does not authenticate its provenance. Download the report artifact for the full verification JSON, Vitest report, and evidence records.',
    '',
  ];
  return lines.join('\n');
}
