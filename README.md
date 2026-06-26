**english** | [русский](https://github.com/diplodoc-platform/ajv/blob/master/README.ru.md)

---

[![NPM version](https://img.shields.io/npm/v/@diplodoc/ajv.svg?style=flat)](https://www.npmjs.org/package/@diplodoc/ajv)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_ajv&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=diplodoc-platform_ajv)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_ajv&metric=coverage)](https://sonarcloud.io/summary/new_code?id=diplodoc-platform_ajv)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_ajv&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=diplodoc-platform_ajv)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_ajv&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=diplodoc-platform_ajv)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_ajv&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=diplodoc-platform_ajv)

# @diplodoc/ajv

JSON schemas for Diplodoc configuration files (`toc.yaml`, `presets.yaml`, frontmatter,
page-constructor, theme, redirects, leading pages, `.yfm`, `.yfmlint`). The schemas are
enriched with editor metadata (`markdownDescription`, `defaultSnippets`, titles) so they
power autocompletion and inline docs in editors such as the Diplodoc VS Code extension.

## Install

```sh
npm install @diplodoc/ajv
```

## Usage

```ts
import {schemas, tocSchema, type SchemaName} from '@diplodoc/ajv';

// the toc.yaml schema
console.log(tocSchema.title);

// or look one up by name
const name: SchemaName = 'presets-schema';
const schema = schemas[name];
```

The raw JSON files are also published and can be imported directly:

```ts
import tocSchema from '@diplodoc/ajv/schemas/toc-schema.json';
```

## How schemas are maintained

- **Source of truth:** `src/yaml/*.yaml` — full, ready-to-use schemas. **Edit only the YAML.**
- **Generated output:** `src/json/*.json` — produced from the YAML by the build script.
  These are committed and shipped.

The build script does one thing: parse YAML and write JSON (formatted with Prettier).
No overlays, no transformations.

```sh
npm run build:schemas          # regenerate src/json from src/yaml
# or, the exported CLI:
npx diplodoc-ajv-build-schemas
```

You never edit the JSON by hand. On every pull request the
[`sync-schemas`](.github/workflows/sync-schemas.yml) workflow regenerates the JSON from the
YAML and commits the result back to the PR branch, so the JSON always matches the YAML.

## Development

```sh
npm install
npm run build      # build:schemas + bundle + d.ts
npm test
npm run typecheck
npm run lint
```
