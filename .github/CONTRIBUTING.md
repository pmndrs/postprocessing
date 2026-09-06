# Contributing

Thanks for contributing! This document covers the development workflow and conventions for working on the project.

## Before you start

For substantial changes, open an issue first to discuss the proposed approach. Keep changes focused and avoid unrelated refactoring.

## Development

Use **pnpm** and the scripts defined in `package.json`.

| Command      | Purpose                                                               |
| ------------ | --------------------------------------------------------------------- |
| `pnpm lint`  | Lint and format the code base with ESLint.                            |
| `pnpm build` | Build the JavaScript, TypeScript declarations, and API documentation. |
| `pnpm watch` | Watch the JavaScript and TypeScript sources and rebuild on changes.   |
| `pnpm test`  | Clean, lint, build, and run the complete test suite.                  |
| `pnpm dev`   | Start development watchers for the lib and accompanying apps.         |

Follow the existing project patterns, abstractions, formatting, and naming conventions. Prefer a small, focused change over introducing new infrastructure or abstractions.

New classes and class members should include appropriate documentation comments.
## Testing

Run the full automated test suite before opening a pull request:

```sh
pnpm test
```

This includes linting, building, unit tests, and end-to-end/rendering tests. All tests should pass before a pull request is considered ready.

Add or update tests for new or changed functionality. Changes that affect rendering or browser behaviour should include an appropriate end-to-end or regression test where practical.

For changes that affect demos or other visual behaviour, manually verify the affected demo when practical. Manual testing complements the automated test suite but does not replace it.

## Pull requests

1. Create a feature branch from the current `dev` branch.
2. Make the smallest focused change that solves the problem.
3. Add or update tests and documentation as appropriate.
4. Verify that all automated tests pass.
5. Push your branch and open a pull request targeting `dev`.
6. Keep the pull request focused and describe what changed and why.

Keep your branch up to date with `dev` if you encounter merge conflicts.

## Reporting bugs

Before opening a bug report, search the issue tracker for an existing report.

Include:

* The library version where the problem occurs.
* Browser and operating system versions.
* Graphics card manufacturer/model when relevant.
* A clear description of what happened and what you expected.
* A minimal reproducible example, such as a JSFiddle or a small standalone example.
* A screenshot or other relevant diagnostic information when useful.

The more self-contained the reproduction is, the easier it is to investigate.
