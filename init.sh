#!/usr/bin/env bash

set -e

NAME=$1

if [ -z "$NAME" ]; then
    echo "Usage: ./init.sh <package-name>"
    exit 1
fi

ORIGIN=$(git remote get-url origin)

# Replace template name in package.json and main README first so that
# subsequent steps (sonar substitution by @diplodoc/infra) pick up the right name.
cp -f README-template.md README.md

for FILE in package.json README.md AGENTS.md; do
    [ -f "$FILE" ] && sed -i '' "s/package-template/$NAME/g" "$FILE"
done

# Remove template section from AGENTS.md
if [ -f AGENTS.md ]; then
    awk '/<!-- TEMPLATE SECTION/,/<!-- END TEMPLATE SECTION -->/ {next} {print}' AGENTS.md > AGENTS.md.tmp && mv AGENTS.md.tmp AGENTS.md
    sed -i '' '/./,$!d' AGENTS.md
fi

# Refresh infrastructure to the latest @diplodoc/infra:
# - re-copies scaffolding files (so sonar-project.properties picks up the new package name)
# - re-runs husky init
# - ensures standard lint scripts in package.json
# - regenerates .release-please-* files from canonical templates
echo "Refreshing @diplodoc/infra scaffolding..."
npx @diplodoc/infra init

# Install dependencies
echo "Installing dependencies..."
npm install

# Remove template-only files (migration docs and template README are not relevant for fresh packages)
rm init.sh README-template.md MIGRATION.md MIGRATION.ru.md

git remote set-url origin ${ORIGIN/package-template/$NAME}
git add --all
git commit --amend -m "initial"
git push
