# @diplodoc/package-template

Template for creating new packages on the [Diplodoc platform](https://diplodoc.com/).

> Migrating from a package created from an older version of this template?
> See [MIGRATION.md](./MIGRATION.md) ([RU](./MIGRATION.ru.md)).

## How to start

```bash
# Clone this repo to a new folder
git clone git@github.com:diplodoc-platform/package-template.git new-package
cd new-package

# Init repo with the new package name
./init.sh new-package
```

The `init.sh` script will:

- Replace `package-template` with your package name in `package.json`,
  `README.md`, and `AGENTS.md`
- Strip the template section from `AGENTS.md`
- Refresh `@diplodoc/infra` scaffolding to the latest version via
  `npx @diplodoc/infra init`:
  - lint configs (`.eslintrc.js`, `.prettierrc.js`, `.stylelintrc.js`, `.lintstagedrc.js`)
  - editor / VCS configs (`.editorconfig`, `.gitattributes`)
  - Git hooks via Husky (`.husky/pre-commit`, `.husky/commit-msg`)
  - CI workflows (`.github/workflows/*.yml`)
  - `.github/CODEOWNERS` and `.github/dependabot.yml`
  - `.release-please-config.json` and `.release-please-manifest.json`
  - SonarCloud config (with `{{PACKAGE_NAME}}` substituted to your new name)
  - Standard `lint`, `lint:fix`, `pre-commit`, `prepare` scripts in `package.json`
- Install dependencies
- Update the git remote URL
- Remove template-only files (`init.sh`, `README-template.md`, `MIGRATION*.md`)

After initialization, you'll have a fully configured package with:

- TypeScript configuration extending `@diplodoc/tsconfig`
- ESLint, Prettier, and Stylelint configured via `@diplodoc/infra` (with
  `.eslintrc.js` extending `@diplodoc/infra/eslint-config`)
- Git hooks via Husky
- Build scripts using `@diplodoc/infra/esbuild` (esbuild is re-exported from
  `@diplodoc/infra`)
- Type declarations generation via `tsc`
- Vitest testing setup with an example test
- GitHub Actions workflows (`tests`, `security`, `coverage`, `release`,
  `release-please`, `package-lock`, `update-deps`)
- GitHub templates (issue templates, PR template) preserved from the template repo
- Dependabot configuration
- Release-please for automated versioning and changelog generation
- SECURITY.md and CONTRIBUTING.md documentation

## How the infrastructure stays in sync

The new package uses the **push** distribution model from `@diplodoc/infra`.
When a new stable version of `@diplodoc/infra` is released, an automated PR
is opened in every consumer repository listed in `@diplodoc/infra`'s
`distribution.yml` with the latest scaffolding (CI workflows, lint configs,
husky hooks, release-please configs, etc.).

To customize per-package exclusions, add a `.infrarc.yml` file at the
package root:

```yaml
exclude:
  - path: .github/workflows/tests.yml
    reason: 'Custom matrix build'
```

See [diplodoc-platform/infra](https://github.com/diplodoc-platform/infra)
for details.

> The template itself (this repository) is also kept in sync via the same
> pipeline if it's listed in `distribution.yml`, so the scaffolding committed
> here is always in line with the canonical version.

## Next steps

1. Update `README.md` with your package description
2. Update `package.json` `description`, `repository`, `bugs` URLs
3. Add your code to `src/index.ts`
4. Configure exports in `package.json` if needed
5. Add tests (Vitest is already configured with an example test)
6. Update GitHub templates (`.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md`) if needed
7. Update `SECURITY.md` with your contact email if different
8. Set up GitHub Secrets for publishing:
   - `NPM_TOKEN`: required for npm publishing
   - `YC_UI_BOT_GITHUB_TOKEN`: required by `release-please.yml` and other workflows
   - `SONAR_TOKEN`: optional, for SonarCloud coverage uploads

## Release process

The package uses [release-please](https://github.com/googleapis/release-please)
for automated releases:

1. Make conventional commits (e.g., `feat: add feature`, `fix: bug fix`)
2. `release-please` automatically creates/updates a release PR
3. Review and merge the release PR
4. `release-please` creates a GitHub release
5. The `release.yml` workflow publishes the package to npm

## Package structure

```
package-name/
├── src/
│   ├── index.ts                  # Main source file
│   └── index.test.ts             # Example test file
├── build/                        # Build output (generated, excluded from VCS)
├── esbuild/
│   └── build.mjs                 # Build configuration (uses @diplodoc/infra/esbuild)
├── .github/
│   ├── ISSUE_TEMPLATE/           # Issue templates (custom)
│   ├── workflows/                # CI/CD workflows (managed by @diplodoc/infra)
│   ├── CODEOWNERS                # managed by @diplodoc/infra
│   ├── dependabot.yml            # managed by @diplodoc/infra
│   └── pull_request_template.md  # custom
├── .husky/                       # managed by @diplodoc/infra
├── tsconfig.json                 # TypeScript config (extends @diplodoc/tsconfig)
├── tsconfig.publish.json         # TypeScript config for declarations
├── vitest.config.mjs             # Vitest configuration
├── .release-please-config.json   # managed by @diplodoc/infra
├── .release-please-manifest.json # managed by @diplodoc/infra
├── .eslintrc.js                  # managed by @diplodoc/infra
├── .prettierrc.js                # managed by @diplodoc/infra
├── .stylelintrc.js               # managed by @diplodoc/infra
├── .lintstagedrc.js              # managed by @diplodoc/infra
├── .editorconfig                 # managed by @diplodoc/infra
├── .gitattributes                # managed by @diplodoc/infra
├── sonar-project.properties      # managed by @diplodoc/infra
├── package.json
├── SECURITY.md
├── CONTRIBUTING.md
└── README.md
```

## Development workflow

1. Make changes in `src/`
2. Run `npm test` to run tests
3. Run `npm run build` to build
4. Run `npm run lint` to check code quality
5. Run `npm run typecheck` to verify types
6. Commit changes (the pre-commit hook will run lint-staged automatically)

## CI/CD

The package ships with a standard set of GitHub Actions workflows
(`@diplodoc/infra`-canonical):

- `tests.yml` — type check, lint, tests, build on Linux/macOS/Windows + Node `vars.NODE_VERSION`
- `security.yml` — weekly `npm audit`
- `coverage.yml` — optional coverage upload (runs when `test:coverage` is defined)
- `release.yml` — publishes the package to npm on release (also supports
  `prerelease` and `deprecate` via `workflow_dispatch`)
- `release-please.yml` — generates release PRs with `CHANGELOG.md` and version bumps
- `package-lock.yml` — keeps `package-lock.json` in sync after PR merges
- `update-deps.yml` — manual workflow to bump `@diplodoc/*` dependencies
