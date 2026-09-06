# Contributing

Thanks for contributing! This document covers the development workflow and conventions for working on the project.

## Before you start

For substantial changes, open an issue first to discuss the approach. Keep changes focused and avoid unrelated refactoring.

Follow existing project patterns, abstractions, formatting, and naming conventions. Prefer small, focused changes over new infrastructure or abstractions. New classes and class members should include appropriate documentation comments.

## Development

Use **pnpm** and the scripts defined in `package.json`. Use `pnpm format` to apply ESLint fixes and `pnpm lint` to check the code.

### Recommended VSCode Plugins

* [ESLint](https://open-vsx.org/extension/dbaeumer/vscode-eslint)
* [Shader languages support](https://open-vsx.org/extension/slevesque/shader)
* [Hugo Language and Syntax Support](https://open-vsx.org/extension/budparr/language-hugo-vscode) (when working on the manual)

## Testing

Add or update tests for changed functionality. During development, use the most targeted test command available such as `pnpm test:unit` for quick iteration. Run the full `pnpm test` for final verification before opening a pull request.

Manually verify affected demos or visual behaviour where practical.

## Pull requests

1. Create a branch from the current `dev` branch.
2. Make the smallest focused change that solves the problem.
3. Add or update tests and documentation as appropriate.
4. Run the relevant checks and final test suite.
5. Open a pull request targeting `dev`, describing what changed and why.

Keep the branch up to date with `dev` if you encounter merge conflicts.

## Reporting bugs

Search the issue tracker before opening a new report.

Include the affected library version, browser and OS versions, a clear description and expected behaviour, and a minimal reproducible example. Include graphics hardware and screenshots or other diagnostics when relevant.
