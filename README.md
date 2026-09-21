# ChangeClause examples

[Tool](https://github.com/changeclause/changeclause) · [Developer docs](https://changeclause.dev/) · [CI reports and reproduction](https://changeclause.dev/examples/) · [Walkthrough](https://changeclause.com/examples/newsletter/) · [Security](SECURITY.md)

Two intentionally open demonstration PRs show why passing tests and meeting a change contract are different questions. This is synthetic TypeScript code, not a customer incident or a production service.

The request: **add newsletter signup, validate the email, store it, and keep authentication out.** The contract is committed on `main` before either implementation.

| Branch | Behavior tests | ChangeClause outcome |
| --- | --- | --- |
| [PR #1 · `demo/signup-pass`](https://github.com/changeclause/examples/pull/1) | 3 pass | PASS |
| [PR #2 · `demo/signup-drift`](https://github.com/changeclause/examples/pull/2) | 3 pass | DRIFT: forbidden authentication dependency |

Keep these PRs open as review examples; they are not feature work to merge. The baseline `main` branch deliberately has no signup implementation or behavior tests.

## Run either example

Use Node 24 and pnpm 10.29.3. Inspect the code before running it.

```sh
git clone https://github.com/changeclause/examples.git
cd examples
git switch demo/signup-drift
pnpm install --frozen-lockfile
pnpm test
```

Build the [ChangeClause MVP](https://github.com/changeclause/changeclause) in a separate checkout at public revision `b2925f9e6433cc94d5bbb2224dbb1143cc5704b5`:

```sh
git clone https://github.com/changeclause/changeclause.git
cd changeclause
git checkout b2925f9e6433cc94d5bbb2224dbb1143cc5704b5
pnpm install --frozen-lockfile
pnpm build
```

Back in the examples checkout, run:

```sh
pnpm verify /absolute/path/to/changeclause
```

Verification intentionally exits **1** on the drifting branch and **0** on the passing branch. Switch branches and repeat to compare. The script exports the contract from the merge base, prepares source-bound evidence, explicitly runs Vitest, imports its report, and verifies the committed PR diff. Artifacts are written outside the repository. It refuses a dirty worktree and keeps failures visible.

## What to inspect

- `.changeclause/newsletter.yaml`: allowed files, required handler/call, forbidden auth dependency, preserved health signature, and three named execution scenarios.
- `src/newsletter.ts`: the drifting branch adds an import and call to `sessionTag` from `src/auth.ts`.
- `src/newsletter.test.ts`: signup, invalid email, and storage failure. All pass in both branches.
- `src/auth.ts`: a harmless synthetic helper. The finding is an architectural constraint violation, not a claim of a security vulnerability.

GitHub Actions shows two separate checks: **Behavior tests** and **ChangeClause contract**. Both pass on the passing PR. On the drifting PR, behavior tests pass and the contract check deliberately fails; open its job summary for the expected-versus-observed table and per-clause findings, including `no-auth-boundary`. A downloadable report artifact contains the full verification JSON, Vitest results, and evidence records. Each demonstration PR also has an expected-result comment linking to a verified run. No exception turns the expected drift into a green contract check. The tool checkout is pinned to the public revision above, with no private repository access or service credentials.

Imported execution evidence remains self-attested even when the demonstration script runs in GitHub Actions; the MVP does not authenticate CI provenance. Selecting a baseline contract is not authenticated approval. PASS covers only declared supported obligations; unsupported or missing evidence needs review.

[Read the walkthrough](https://changeclause.com/examples/newsletter/) · [Share a tricky change](https://changeclause.com/share/)

## Contributing and reuse

Use the issue templates for unclear examples or reproduction failures. Explain expected behavior and contract outcomes in proposed changes; preserve the deliberately open demonstration PRs. Read [NOTICE](NOTICE) before reusing or contributing code: this repository currently has no open-source license. The public tool has its own separate license.
