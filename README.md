# ChangeClause examples

Two intentionally open demonstration PRs show why passing tests and meeting a change contract are different questions. This is synthetic TypeScript code, not a customer incident or a production service.

The request: **add newsletter signup, validate the email, store it, and keep authentication out.** The contract is committed on `main` before either implementation.

| Branch | Behavior tests | ChangeClause outcome |
| --- | --- | --- |
| `demo/signup-pass` | 3 pass | PASS |
| `demo/signup-drift` | 3 pass | DRIFT: forbidden authentication dependency |

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

Build the [ChangeClause MVP](https://github.com/changeclause/changeclause) in a separate checkout, following its README, then:

```sh
pnpm verify /absolute/path/to/changeclause
```

Verification intentionally exits **1** on the drifting branch and **0** on the passing branch. Switch branches and repeat to compare. The script exports the contract from the merge base, prepares source-bound evidence, explicitly runs Vitest, imports its report, and verifies the committed PR diff. Artifacts are written outside the repository. It refuses a dirty worktree and keeps failures visible.

## What to inspect

- `.changeclause/newsletter.yaml`: allowed files, required handler/call, forbidden auth dependency, preserved health signature, and three named execution scenarios.
- `src/newsletter.ts`: the drifting branch adds an import and call to `sessionTag` from `src/auth.ts`.
- `src/newsletter.test.ts`: signup, invalid email, and storage failure. All pass in both branches.
- `src/auth.ts`: a harmless synthetic helper. The finding is an architectural constraint violation, not a claim of a security vulnerability.

GitHub Actions runs the behavior tests only. It is deliberately labeled **Behavior tests**: a green check does not mean the ChangeClause contract passed. Imported execution evidence is self-attested, not a signed CI attestation. Selecting a baseline contract is not authenticated approval. PASS covers only declared supported obligations; unsupported or missing evidence needs review.

[Read the walkthrough](https://changeclause.com/examples/newsletter/) · [Share a tricky change](https://changeclause.com/share/)
