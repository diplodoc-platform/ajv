<!-- TEMPLATE SECTION - This section will be removed after running init.sh -->
<!-- ============================================================================ -->
<!-- TEMPLATE: Package Template Documentation -->
<!-- ============================================================================ -->

# AGENTS.md - Package Template

This file is part of the `@diplodoc/package-template` package. After running
`./init.sh`, the template section below will be removed and only the
package-specific section will remain.

## Template Overview

`@diplodoc/package-template` is the starting point for creating new packages
on the Diplodoc platform. It ships with:

- TypeScript configuration extending `@diplodoc/tsconfig`
- Build setup using `@diplodoc/infra/esbuild` (esbuild is re-exported from `@diplodoc/infra`)
- Vitest testing setup with an example test
- A full set of canonical `@diplodoc/infra` scaffolding files **committed
  in-tree** (workflows, lint configs, husky hooks, sonar config, etc.) so the
  template itself is a fully working package
- A minimal `init.sh` that renames the package and re-runs
  `@diplodoc/infra init` to refresh scaffolding to the latest version
- Migration docs (`MIGRATION.md`, `MIGRATION.ru.md`) for users coming from
  the pre-`@diplodoc/infra` version of the template

## Important Notes for Template Maintainers

- **Scaffolding files are owned by `@diplodoc/infra`.** Do not edit
  `.eslintrc.js`, `.prettierrc.js`, `.stylelintrc.js`, `.lintstagedrc.js`,
  `.editorconfig`, `.gitattributes`, `.husky/*`, `sonar-project.properties`,
  or files under `.github/workflows/` directly. The canonical source is
  `devops/infra/scaffolding/` in the metapackage (or `@diplodoc/infra`
  standalone). Edits made here will be overwritten by the distribution
  pipeline or by `npx @diplodoc/infra init`.
- **`package-template` should appear in `@diplodoc/infra`'s `distribution.yml`**
  so the template repo itself receives scaffolding updates via PR. If it
  isn't there yet, add it.
- **Keep `package.json` minimal.** Only template-specific entries belong here.
  Scripts `lint`, `lint:fix`, `pre-commit`, `prepare` are auto-managed by
  `@diplodoc/infra` (`modify-package.js`).
- **`esbuild` must NOT be a direct dependency.** Import it from
  `@diplodoc/infra/esbuild` — esbuild is re-exported by `@diplodoc/infra`,
  which pins a single version across the platform.
- **`sonar-project.properties`** has `package-template` hard-coded in
  `sonar.projectKey` / `sonar.projectName`. The canonical scaffolding uses
  `{{PACKAGE_NAME}}` placeholders — `@diplodoc/infra init` substitutes them
  based on `package.json` `name`. When the user runs `init.sh`, the file is
  re-copied from scaffolding and the new package name is substituted in.
- When the canonical infra changes (new workflow files, new config patterns),
  update `MIGRATION.md` / `MIGRATION.ru.md` so existing consumers know how to
  migrate their packages.

## Template Usage

1. Clone the template repository
2. Run `./init.sh <package-name>` to initialize
3. The script will:
   - Replace `package-template` with your package name in `package.json` /
     `README.md` / `AGENTS.md`
   - Strip the template section from `AGENTS.md`
   - Run `npx @diplodoc/infra init` to refresh scaffolding to the latest
     (and substitute `{{PACKAGE_NAME}}` in sonar config)
   - Install dependencies
   - Remove template-only files (`init.sh`, `README-template.md`, `MIGRATION*.md`)

<!-- END TEMPLATE SECTION -->
<!-- ============================================================================ -->

# AGENTS.md

A guide for AI coding agents working on this package.

## Common Rules and Standards

**Important**: This package follows common rules and standards defined in the Diplodoc metapackage. When working in metapackage mode, refer to:

- **`.agents/style-and-testing.md`** in the metapackage root for:
  - Code style guidelines
  - Commit message format (Conventional Commits)
  - Pre-commit hooks rules (**CRITICAL**: Never commit with `--no-verify`)
  - Testing standards
  - Documentation requirements
- **`.agents/core.md`** for core concepts
- **`.agents/monorepo.md`** for workspace and dependency management
- **`.agents/dev-infrastructure.md`** for build and CI/CD

**Note**: In standalone mode (when this package is used independently), these rules still apply. If you need to reference the full documentation, check the [Diplodoc metapackage repository](https://github.com/diplodoc-platform/diplodoc).

## Package Overview

<!-- TODO: Add package description after initialization -->

This package is part of the Diplodoc metapackage. It provides [describe functionality].

## Setup Commands

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Type check
npm run typecheck
```

## Development Commands

```bash
# Run tests (if configured)
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Package Structure

```
package-name/
├── src/
│   ├── index.ts          # Main source file
│   └── index.test.ts     # Example test file
├── build/                # Build output directory (generated)
│   ├── index.js          # Bundled JavaScript
│   └── index.d.ts        # TypeScript declarations
├── esbuild/
│   └── build.mjs         # Build configuration (uses @diplodoc/infra/esbuild)
├── .github/              # GitHub config (workflows etc. managed by @diplodoc/infra)
├── .husky/               # Git hooks (managed by @diplodoc/infra)
├── tsconfig.json         # TypeScript config (extends @diplodoc/tsconfig)
├── tsconfig.publish.json # TypeScript config for publishing
├── vitest.config.mjs     # Vitest configuration
├── package.json
├── SECURITY.md
├── CONTRIBUTING.md
└── README.md
```

## Build System

The package uses **esbuild** (re-exported from `@diplodoc/infra`) for fast
builds:

- Entry point: `src/index.ts`
- Output directory: `build/`
- Output files:
  - `build/index.js` — bundled JavaScript (with sourcemaps)
  - `build/index.d.ts` — TypeScript declarations (generated via `tsc`)

Build process:

1. `build:clean` — removes the build directory
2. `build:js` — bundles JavaScript via `esbuild` from `@diplodoc/infra/esbuild`
3. `build:declarations` — generates TypeScript declarations via
   `tsc --project tsconfig.publish.json`

**Important**: do not add `esbuild` as a direct dependency. Always import it
from `@diplodoc/infra/esbuild` — that's how the platform pins a single
esbuild version across all packages.

## TypeScript Configuration

Extends `@diplodoc/tsconfig` with:

- Target: ES2022
- Module: ES2022
- Declaration files enabled

## Linting and Code Quality

Linting is configured via `@diplodoc/infra`:

- ESLint for JavaScript/TypeScript
- Prettier for code formatting
- Stylelint for CSS/SCSS (if applicable)
- Git hooks via Husky
- Pre-commit checks via lint-staged

Configuration files are **owned by `@diplodoc/infra`** and **must not be
edited manually**:

- `.eslintrc.js`
- `.prettierrc.js`
- `.stylelintrc.js`
- `.lintstagedrc.js`
- `.editorconfig`
- `.gitattributes`
- `.husky/pre-commit`, `.husky/commit-msg`
- `sonar-project.properties`

They are updated via automated PRs from the `@diplodoc/infra` distribution
pipeline (see the `distribute-infra.yml` workflow in
[diplodoc-platform/infra](https://github.com/diplodoc-platform/infra)).

To customize per-package exclusions, add a `.infrarc.yml` file at the package
root listing files to skip during the next sync.

## Testing

The package uses **Vitest** for testing (recommended framework for the Diplodoc platform):

- Configuration: `vitest.config.mjs`
- Test files: `src/**/*.test.ts` or `src/**/*.spec.ts`
- Coverage: enabled via `@vitest/coverage-v8`

**Test commands**:

- `npm test` — Run tests once
- `npm run test:watch` — Run tests in watch mode
- `npm run test:coverage` — Run tests with coverage report

**Example test**: see `src/index.test.ts` for a basic example.

For E2E tests, consider using Playwright (see `devops/testpack` for examples).

## Important Notes

1. **Metapackage vs Standalone**: This package can be used both as part of the metapackage (workspace mode) and as a standalone npm package. All scripts must work in both contexts.

2. **Linting / scaffolding**: Lint configs, husky hooks, CI workflows,
   release-please configs, CODEOWNERS, dependabot, and SonarCloud config are
   managed by `@diplodoc/infra`. Do not edit them manually — they are
   overwritten by automated PRs.

3. **Build Output**: The build outputs files to the `build/` directory. Update the `package.json` `files` field if adding more output files.

4. **Type Exports**: Ensure `package.json` has a correct `types` field pointing to declaration files in `build/`.

5. **Documentation**: Update this file and `README.md` with package-specific information after initialization.

6. **`package.json` Maintenance**: Periodically check that `package.json` fields (description, repository URL, bugs URL, etc.) are accurate and up-to-date. Verify that dependency versions are current and compatible with the project standards.

## CI/CD

The package gets a standard set of GitHub Actions workflows from `@diplodoc/infra`:

- **tests.yml** — type check, lint, tests, and build on Linux/macOS/Windows
- **security.yml** — weekly `npm audit`
- **coverage.yml** — optional coverage upload (runs when `test:coverage` is defined)
- **release-please.yml** — generates release PRs with `CHANGELOG.md` and version bumps
- **release.yml** — publishes the package to npm on release / dispatch
- **package-lock.yml** — keeps `package-lock.json` in sync
- **update-deps.yml** — manual workflow to bump `@diplodoc/*` dependencies

### Release Process

The package uses **release-please** for automated versioning and publishing:

1. **release-please workflow** (`.github/workflows/release-please.yml`):
   - Runs on push to `master`
   - Analyzes conventional commits to determine version bumps
   - Creates release PRs with updated version and `CHANGELOG.md`
   - When a release PR is merged, creates a GitHub release with tag `vX.Y.Z`

2. **Publish workflow** (`.github/workflows/release.yml`):
   - Triggers automatically when a release is created
   - Runs tests, type checking, and build
   - Verifies package contents and version matching
   - Publishes to npm with provenance

**Version Bump Rules**:

- `feat`: minor version bump
- `fix`: patch version bump
- Breaking changes (e.g., `feat!: breaking change`): major version bump
- `chore`, `docs`, `refactor`: no version bump (unless breaking)

**Required Secrets**:

- `NPM_TOKEN` — npm authentication token for publishing
- `YC_UI_BOT_GITHUB_TOKEN` — token used by `release-please.yml` and other workflows
- `SONAR_TOKEN` — optional, for SonarCloud coverage uploads

## GitHub Integration

- **Issue templates**: bug reports and feature requests (`.github/ISSUE_TEMPLATE/`)
- **Pull request template**: standardized PR format (`.github/pull_request_template.md`)
- **Dependabot**: automated dependency updates (`.github/dependabot.yml`, managed by `@diplodoc/infra`)
- **CODEOWNERS**: managed by `@diplodoc/infra`

## Documentation Files

- **SECURITY.md** — security policy and vulnerability reporting
- **CONTRIBUTING.md** — contribution guidelines and development workflow
- **AGENTS.md** — this file — guide for AI coding agents

## Additional Resources

- Metapackage `.agents/` — platform-wide agent documentation
- [`@diplodoc/infra`](https://github.com/diplodoc-platform/infra) — linting, scaffolding, and distribution
- `@diplodoc/tsconfig` — TypeScript configuration reference
