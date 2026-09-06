# AGENTS.md

Development and contribution guidance for this repository is documented in [`CONTRIBUTING.md`](CONTRIBUTING.md).

Agents should follow `CONTRIBUTING.md`, including its development workflow, testing requirements, coding conventions, and scope guidelines.

## Validation

Before considering a change complete:

* Run `pnpm test`.
* Ensure all tests pass.
* Add or update tests when changing functionality, including end-to-end/rendering tests where appropriate.
* Distinguish pre-existing failures from regressions introduced by the change.

When repository-specific intent is unclear, inspect the source code, tests, and documentation before making assumptions. `llms.txt` provides a generated overview of relevant documentation and can be useful for orientation, but the source code remains authoritative.
