# Migration guide

> [Русская версия](./MIGRATION.ru.md)

This document explains how to migrate a package that was created from an
older version of `@diplodoc/package-template` (pre-`@diplodoc/infra` era) to
the current infrastructure based on `@diplodoc/infra`.

If you're bootstrapping a brand new package via `./init.sh`, you can ignore
this document — `@diplodoc/infra init` will set everything up for you. This
guide is only for **existing packages** that need to be migrated.

## What changed

The Diplodoc platform consolidated several legacy packages
(`@diplodoc/lint`, `@diplodoc/eslint-config`, `@diplodoc/prettier-config`) and
the package-template's own scaffolding into a single package called
[`@diplodoc/infra`](https://github.com/diplodoc-platform/infra).

`@diplodoc/infra` provides:

- shared lint configs (ESLint, Prettier, Stylelint, lint-staged)
- shared CI workflows (`tests.yml`, `security.yml`, `release.yml`,
  `release-please.yml`, `coverage.yml`, `package-lock.yml`, `update-deps.yml`)
- shared husky hooks
- shared release-please templates
- a re-export of `esbuild` under `@diplodoc/infra/esbuild`
- an automated **push-based distribution pipeline**: every stable release of
  `@diplodoc/infra` opens a PR in each consumer repository with the latest
  scaffolding

Existing packages no longer maintain copies of these files locally — the
files are kept in sync via PRs from the distribution pipeline.

## Step-by-step migration

### 1. Replace `@diplodoc/lint` with `@diplodoc/infra` in `package.json`

In `devDependencies`:

```diff
-  "@diplodoc/lint": "^1.9.2",
+  "@diplodoc/infra": "^2.0.1"
```

### 2. Remove the direct `esbuild` dependency

`@diplodoc/infra` re-exports `esbuild`, so consumers should not pin their own
version (that would create version skew across the platform).

In `devDependencies`:

```diff
-  "esbuild": "^0.27.2",
```

### 3. Update the build script to import esbuild from `@diplodoc/infra`

In `esbuild/build.mjs` (or `esbuild/build.js`):

```diff
-import {build} from 'esbuild';
+import {build} from '@diplodoc/infra/esbuild';
```

For type hints in JSDoc:

```diff
-/** @type {import('esbuild').BuildOptions} */
+/** @type {import('@diplodoc/infra/esbuild').BuildOptions} */
```

If you also use the `esbuild-sass-plugin`, drop it from `devDependencies` —
it's re-exported as well:

```diff
-import {sassPlugin} from 'esbuild-sass-plugin';
+import {sassPlugin} from '@diplodoc/infra/esbuild';
```

### 4. Update the standard scripts in `package.json`

The legacy template added a `lint update && ...` prefix to every lint script
(pull-based distribution). The new infrastructure delivers updates via PRs,
so the prefix must be removed:

```diff
   "scripts": {
-    "lint": "lint update && lint",
-    "lint:fix": "lint update && lint fix",
-    "pre-commit": "lint update && lint-staged",
+    "lint": "lint",
+    "lint:fix": "lint fix",
+    "pre-commit": "lint-staged",
     "prepare": "husky || true",
   }
```

> `@diplodoc/infra init` (or `@diplodoc/infra update`) auto-migrates these
> known legacy values. If you have non-standard customizations, infra will
> keep them and print a warning.

### 5. Bootstrap the new infrastructure

From the package root, run:

```bash
npx @diplodoc/infra init
```

This will:

- add/update the standard `lint`, `lint:fix`, `pre-commit`, `prepare` scripts
- run `husky init`
- copy scaffolding files (lint configs, husky hooks, workflows, dependabot,
  CODEOWNERS, sonar-project.properties, editor configs)
- update `.gitignore` / `.eslintignore` / `.prettierignore` / `.stylelintignore`
- create or update `.release-please-config.json` and
  `.release-please-manifest.json` from the canonical templates

Then install:

```bash
npm install
```

### 6. Sync scaffolding files

These files are owned by `@diplodoc/infra`. Either re-run
`npx @diplodoc/infra init` (it overwrites them from the canonical scaffolding)
or, if you want to be explicit, ensure the following are in their canonical
infra-shipped form (consult `devops/infra/scaffolding/` in the metapackage):

- `.github/workflows/tests.yml`, `security.yml`, `release.yml` (note the
  rename from `release.yaml`), `release-please.yml`, `coverage.yml`,
  `package-lock.yml`, `update-deps.yml`
- `.github/CODEOWNERS`
- `.github/dependabot.yml`
- `.eslintrc.js`, `.prettierrc.js`, `.stylelintrc.js`, `.lintstagedrc.js`
- `.editorconfig`, `.gitattributes`
- `.husky/pre-commit`, `.husky/commit-msg`
- `sonar-project.properties` (with the right `sonar.projectKey` /
  `sonar.projectName`)

`.github/ISSUE_TEMPLATE/*` and `.github/pull_request_template.md` are **not**
managed by `@diplodoc/infra` — keep your local versions.

If you previously had `.eslintrc.js` & co listed in `.gitignore` (the
pre-`@diplodoc/infra` template did that on the assumption they'd be generated
locally), remove them from `.gitignore` — these files are now committed.

### 7. Update `.release-please-config.json`

The old template's release-please config used a `"package-name"` field. The
new infra template uses `"include-component-in-tag": false` instead and does
not set `"package-name"`. `@diplodoc/infra init` will create the file if it
doesn't exist, but it does **not** overwrite an existing one. To pick up the
new format, delete your old file and re-run `npx @diplodoc/infra init`, or
update it manually:

```json
{
  "tagPrefix": "v",
  "packages": {
    ".": {
      "release-type": "node",
      "include-component-in-tag": false,
      "changelog-path": "CHANGELOG.md",
      "version-file": "package.json",
      "changelog-types": [
        {"type": "feat", "section": "Features"},
        {"type": "fix", "section": "Bug Fixes"},
        {"type": "perf", "section": "Performance"},
        {"type": "refactor", "section": "Refactoring"},
        {"type": "docs", "section": "Documentation"},
        {"type": "chore", "section": "Chores"},
        {"type": "revert", "section": "Reverts"}
      ]
    }
  },
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json"
}
```

### 8. Update `.gitignore`

Replace the comment header for the auto-generated lint section:

```diff
-# Auto-generated by @diplodoc/lint (do not commit)
+# Auto-generated by @diplodoc/infra (do not commit)
```

`@diplodoc/infra init` will also append the standard system / build /
install ignores if they are missing — this is idempotent and safe to re-run.

### 9. Bump `.nvmrc` to Node 22

The platform standardized on Node 22. Update `.nvmrc`:

```
22
```

### 10. (Optional) Add `.infrarc.yml` for local exclusions

If your package needs to opt out of specific scaffolded files, create
`.infrarc.yml` in the package root:

```yaml
exclude:
  - path: .github/workflows/tests.yml
    reason: 'Custom matrix build for multiple Node versions'
```

These local exclusions are merged with the central exclusions from
`distribution.yml` in `@diplodoc/infra`.

### 11. (Optional) Onboard the repository to the distribution pipeline

If your package's repository isn't yet listed in `@diplodoc/infra`'s
`distribution.yml`, add it there. Once onboarded, every stable release of
`@diplodoc/infra` will open a PR in your repo with scaffolding updates. See
[ADR-001](https://github.com/diplodoc-platform/infra/blob/master/adr/ADR-001-infra-distribution-pipeline.md)
for the full design.

## Verification checklist

After migration, verify that everything works:

- [ ] `npm install` completes without errors
- [ ] `npm run lint` runs (no `lint update && ...` prefix)
- [ ] `npm run build` produces `build/index.js` + `build/index.d.ts`
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes
- [ ] `.eslintrc.js`, `.prettierrc.js`, `.lintstagedrc.js`, etc. start with
      the `⚠️ AUTO-GENERATED FILE — DO NOT EDIT MANUALLY` banner from infra
- [ ] `package.json` no longer contains `esbuild` or `@diplodoc/lint`
- [ ] CI passes on a clean PR

## Common pitfalls

- **`esbuild` versions diverge across packages.** Always import from
  `@diplodoc/infra/esbuild`, never pin esbuild directly. The version is
  controlled by `@diplodoc/infra`.

- **Manual edits to `.eslintrc.js` / workflow files get reverted.** These
  files are owned by `@diplodoc/infra`. To customize, either:
  - update the canonical scaffolding in `diplodoc-platform/infra`, or
  - add the file to `.infrarc.yml` `exclude` (then maintain a local copy).

- **The `lint update && ...` prefix breaks CI.** The pull-based update flow
  was removed. Lint scripts must be plain `lint` / `lint fix` /
  `lint-staged`. `@diplodoc/infra init` auto-migrates known legacy values.

- **`require('esbuild')` in `*.cjs`.** Use
  `require('@diplodoc/infra/esbuild')` instead — the package exports both an
  ESM (`import`) and CJS (`default`/`require`) entry point.

- **Missing GitHub secrets.** The new `release.yml` workflow needs
  `NPM_TOKEN`. The `release-please.yml` workflow needs
  `YC_UI_BOT_GITHUB_TOKEN`.

## Need help?

- `@diplodoc/infra` docs: <https://github.com/diplodoc-platform/infra>
- ADR for the distribution pipeline:
  [ADR-001](https://github.com/diplodoc-platform/infra/blob/master/adr/ADR-001-infra-distribution-pipeline.md)
- Open an issue on
  [diplodoc-platform/infra](https://github.com/diplodoc-platform/infra/issues)
