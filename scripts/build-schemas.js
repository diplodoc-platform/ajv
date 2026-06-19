#!/usr/bin/env node
'use strict';
const {readFileSync, writeFileSync, readdirSync, mkdirSync} = require('fs');
const {join, basename} = require('path');
const {load} = require('js-yaml');

const SRC = join(__dirname, '..', 'src', 'yaml');
const OUTPUT = join(__dirname, '..', 'src', 'json');

function main() {
    mkdirSync(OUTPUT, {recursive: true});

    const files = readdirSync(SRC)
        .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
        .sort();

    let ok = true;

    for (const file of files) {
        const name = basename(file).replace(/\.ya?ml$/, '');

        try {
            const schema = load(readFileSync(join(SRC, file), 'utf8'));
            writeFileSync(join(OUTPUT, `${name}.json`), JSON.stringify(schema, null, 2) + '\n');
            console.log(`✓ ${name}.json`);
        } catch (err) {
            console.error(`✗ ${name}: ${err.message}`);
            ok = false;
        }
    }

    process.exit(ok ? 0 : 1);
}

main();
