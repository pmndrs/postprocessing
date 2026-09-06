# AGENTS.md

Follow [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) for repository development and contribution guidance.

## Agent guidance

* Follow existing project patterns and inspect relevant source code, tests, and documentation before making assumptions.
* Keep changes focused and avoid unrelated refactoring.
* Use the project's scripts rather than invoking underlying tools directly.
* `pnpm lint` is read-only; use `pnpm format` when ESLint fixes are needed.
* Tests rely on the built bundle and require `pnpm build:js` after source changes.
* Distinguish pre-existing test failures from regressions introduced by the change.
* Treat source code and tests as authoritative.
* Content in `apps/manual` may be outdated depending on the situation.

Before considering a change complete, run the relevant checks from `CONTRIBUTING.md`, including `pnpm test` for final verification.

When a check fails, first determine whether the failure is caused by the change. If necessary, compare against the pristine baseline using `git stash` or a separate `git worktree`.
