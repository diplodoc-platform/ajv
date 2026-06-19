# Руководство по миграции

> [English version](./MIGRATION.md)

Этот документ описывает, как мигрировать пакет, созданный из старой версии
`@diplodoc/package-template` (до появления `@diplodoc/infra`), на актуальную
инфраструктуру на базе `@diplodoc/infra`.

Если вы создаёте **новый** пакет через `./init.sh` — этот документ можно
пропустить, `@diplodoc/infra init` сделает всё сам. Руководство нужно только
для **существующих** пакетов, которые требуется обновить.

## Что изменилось

Платформа Diplodoc объединила несколько устаревших пакетов
(`@diplodoc/lint`, `@diplodoc/eslint-config`, `@diplodoc/prettier-config`) и
скаффолдинг самого `package-template` в один пакет —
[`@diplodoc/infra`](https://github.com/diplodoc-platform/infra).

`@diplodoc/infra` предоставляет:

- общие линтер-конфиги (ESLint, Prettier, Stylelint, lint-staged);
- общие CI-воркфлоу (`tests.yml`, `security.yml`, `release.yml`,
  `release-please.yml`, `coverage.yml`, `package-lock.yml`, `update-deps.yml`);
- общие husky-хуки;
- общие шаблоны release-please;
- ре-экспорт `esbuild` под именем `@diplodoc/infra/esbuild`;
- автоматический **push-pipeline дистрибуции**: при каждом стабильном релизе
  `@diplodoc/infra` в каждом репозитории-потребителе автоматически
  создаётся PR с обновлённым скаффолдингом.

Существующие пакеты больше не хранят локальные копии этих файлов — они
синхронизируются через PR от pipeline дистрибуции.

## Пошаговая миграция

### 1. Заменить `@diplodoc/lint` на `@diplodoc/infra` в `package.json`

В блоке `devDependencies`:

```diff
-  "@diplodoc/lint": "^1.9.2",
+  "@diplodoc/infra": "^2.0.1"
```

### 2. Удалить прямую зависимость `esbuild`

`@diplodoc/infra` ре-экспортирует `esbuild`, поэтому потребители не должны
держать свою версию (это создаёт расхождение версий между пакетами
платформы).

В блоке `devDependencies`:

```diff
-  "esbuild": "^0.27.2",
```

### 3. Обновить билд-скрипт, чтобы импортировать esbuild из `@diplodoc/infra`

В файле `esbuild/build.mjs` (или `esbuild/build.js`):

```diff
-import {build} from 'esbuild';
+import {build} from '@diplodoc/infra/esbuild';
```

Для подсказок типов в JSDoc:

```diff
-/** @type {import('esbuild').BuildOptions} */
+/** @type {import('@diplodoc/infra/esbuild').BuildOptions} */
```

Если используется `esbuild-sass-plugin` — удалите его из `devDependencies`,
он тоже ре-экспортируется:

```diff
-import {sassPlugin} from 'esbuild-sass-plugin';
+import {sassPlugin} from '@diplodoc/infra/esbuild';
```

### 4. Обновить стандартные скрипты в `package.json`

Старый шаблон добавлял префикс `lint update && ...` ко всем lint-скриптам
(модель pull-дистрибуции). Новая инфраструктура доставляет обновления через
PR, поэтому префикс нужно убрать:

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

> `@diplodoc/infra init` (или `@diplodoc/infra update`) сам мигрирует
> известные легаси-значения. Если у вас нестандартные кастомизации — infra
> их оставит и выведет предупреждение.

### 5. Развернуть новую инфраструктуру

Из корня пакета:

```bash
npx @diplodoc/infra init
```

Команда:

- добавит/обновит стандартные скрипты `lint`, `lint:fix`, `pre-commit`,
  `prepare`;
- запустит `husky init`;
- скопирует файлы скаффолдинга (lint-конфиги, husky-хуки, воркфлоу,
  dependabot, CODEOWNERS, sonar-project.properties, editor-конфиги);
- обновит `.gitignore` / `.eslintignore` / `.prettierignore` /
  `.stylelintignore`;
- создаст или обновит `.release-please-config.json` и
  `.release-please-manifest.json` из канонических шаблонов.

Затем установите зависимости:

```bash
npm install
```

### 6. Синхронизировать scaffolding-файлы

Этими файлами владеет `@diplodoc/infra`. Можно либо просто перезапустить
`npx @diplodoc/infra init` (он перезапишет их из канонического
скаффолдинга), либо вручную привести к каноническому виду из
`devops/infra/scaffolding/` (метапакет):

- `.github/workflows/tests.yml`, `security.yml`, `release.yml` (внимание:
  переименовали из `release.yaml`), `release-please.yml`, `coverage.yml`,
  `package-lock.yml`, `update-deps.yml`;
- `.github/CODEOWNERS`;
- `.github/dependabot.yml`;
- `.eslintrc.js`, `.prettierrc.js`, `.stylelintrc.js`, `.lintstagedrc.js`;
- `.editorconfig`, `.gitattributes`;
- `.husky/pre-commit`, `.husky/commit-msg`;
- `sonar-project.properties` (с актуальными `sonar.projectKey` /
  `sonar.projectName`).

`.github/ISSUE_TEMPLATE/*` и `.github/pull_request_template.md` **не**
управляются `@diplodoc/infra` — оставьте свои версии.

Если в `.gitignore` раньше были `.eslintrc.js` и компания (старая версия
шаблона ожидала, что эти файлы создаются локально и не коммитятся) —
уберите их оттуда: теперь эти файлы коммитятся в репозиторий.

### 7. Обновить `.release-please-config.json`

В старом шаблоне в release-please-конфиге было поле `"package-name"`. В
новом infra-шаблоне используется `"include-component-in-tag": false`, а
`"package-name"` не указывается. `@diplodoc/infra init` создаёт файл,
если его нет, но **не перезаписывает** существующий. Чтобы перейти на
новый формат, удалите старый файл и заново запустите
`npx @diplodoc/infra init`, либо отредактируйте вручную:

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

### 8. Обновить `.gitignore`

Поменяйте комментарий-заголовок секции автогенерируемых файлов:

```diff
-# Auto-generated by @diplodoc/lint (do not commit)
+# Auto-generated by @diplodoc/infra (do not commit)
```

`@diplodoc/infra init` также допишет стандартные системные / билд /
install-паттерны игнора, если их нет — это идемпотентно и безопасно
запускать повторно.

### 9. Обновить `.nvmrc` до Node 22

Платформа стандартизирована на Node 22. Обновите `.nvmrc`:

```
22
```

### 10. (Опционально) Добавить `.infrarc.yml` для локальных исключений

Если пакету нужно отказаться от какого-то из скаффолдинг-файлов — создайте
`.infrarc.yml` в корне пакета:

```yaml
exclude:
  - path: .github/workflows/tests.yml
    reason: 'Своя матричная сборка под несколько версий Node'
```

Локальные исключения объединяются (union) с центральными исключениями из
`distribution.yml` в `@diplodoc/infra`.

### 11. (Опционально) Подключить репозиторий к pipeline дистрибуции

Если репозитория вашего пакета ещё нет в `distribution.yml` из
`@diplodoc/infra` — добавьте его туда. После подключения каждый стабильный
релиз `@diplodoc/infra` будет создавать PR в вашем репозитории с
обновлённым скаффолдингом. Полный дизайн pipeline описан в
[ADR-001](https://github.com/diplodoc-platform/infra/blob/master/adr/ADR-001-infra-distribution-pipeline.md).

## Чек-лист проверки

После миграции убедитесь, что всё работает:

- [ ] `npm install` отрабатывает без ошибок;
- [ ] `npm run lint` запускается (без префикса `lint update && ...`);
- [ ] `npm run build` создаёт `build/index.js` + `build/index.d.ts`;
- [ ] `npm test` проходит;
- [ ] `npm run typecheck` проходит;
- [ ] `.eslintrc.js`, `.prettierrc.js`, `.lintstagedrc.js` и т.д. начинаются
      с банера `⚠️ AUTO-GENERATED FILE — DO NOT EDIT MANUALLY` от infra;
- [ ] в `package.json` нет ни `esbuild`, ни `@diplodoc/lint`;
- [ ] CI на чистом PR проходит.

## Частые ошибки

- **Версии `esbuild` расходятся между пакетами.** Всегда импортируйте
  `esbuild` из `@diplodoc/infra/esbuild`, никогда не закрепляйте `esbuild`
  напрямую. Версию контролирует `@diplodoc/infra`.

- **Ручные правки в `.eslintrc.js` / воркфлоу пропадают.** Этими файлами
  владеет `@diplodoc/infra`. Кастомизировать можно двумя способами:
  - обновить канонический скаффолдинг в `diplodoc-platform/infra`;
  - добавить файл в `exclude` в `.infrarc.yml` (тогда хранить свою копию
    в репозитории придётся самим).

- **Префикс `lint update && ...` ломает CI.** Pull-модель обновлений
  убрана. Lint-скрипты должны быть просто `lint` / `lint fix` /
  `lint-staged`. `@diplodoc/infra init` сам мигрирует известные
  легаси-значения.

- **`require('esbuild')` в `*.cjs`.** Используйте
  `require('@diplodoc/infra/esbuild')` — пакет экспортирует и ESM
  (`import`), и CJS (`default`/`require`) entry point.

- **Не настроены GitHub-секреты.** Новому `release.yml` нужен
  `NPM_TOKEN`. Воркфлоу `release-please.yml` нужен
  `YC_UI_BOT_GITHUB_TOKEN`.

## Где получить помощь

- Документация `@diplodoc/infra`: <https://github.com/diplodoc-platform/infra>
- ADR pipeline дистрибуции:
  [ADR-001](https://github.com/diplodoc-platform/infra/blob/master/adr/ADR-001-infra-distribution-pipeline.md)
- Можно завести issue в
  [diplodoc-platform/infra](https://github.com/diplodoc-platform/infra/issues)
