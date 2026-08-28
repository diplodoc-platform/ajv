import {describe, expect, it} from 'vitest';
import {load} from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import * as schemas from './index';

const SCHEMAS = [
    'buildManifestSchema',
    'frontmatterSchema',
    'leadingSchema',
    'pageConstructorSchema',
    'presetsSchema',
    'redirectsSchema',
    'themeSchema',
    'tocSchema',
    'yfmSchema',
    'yfmlintSchema',
] as const;

describe('exports', () => {
    it.each(SCHEMAS)('%s exports json object and yaml string', (name) => {
        const json = schemas[`${name}Json`] as Record<string, unknown>;
        const yaml = schemas[`${name}Yaml`] as unknown as string;

        expect(json).toBeTypeOf('object');
        expect(Object.keys(json).length).toBeGreaterThan(0);
        expect(yaml).toBeTypeOf('string');
        expect(load(yaml)).toEqual(json);
    });
});

describe('schema validity (ajv)', () => {
    const COMPILABLE = SCHEMAS.filter((name) => name !== 'pageConstructorSchema');

    it.each(COMPILABLE)('compiles %s with ajv', (name) => {
        const ajv = new Ajv({strict: false, allowUnionTypes: true});
        addFormats(ajv);

        expect(() => ajv.compile(schemas[`${name}Json`])).not.toThrow();
    });
});

describe('toc noIndex', () => {
    const ajv = new Ajv({strict: false, allowUnionTypes: true});
    addFormats(ajv);
    const validate = ajv.compile(schemas.tocSchemaJson);

    it.each([
        {noIndex: true},
        {items: [{name: 'Private page', href: 'private.md', noIndex: true}]},
        {items: [{name: 'Public page', href: 'public.md', noIndex: false}]},
    ])('accepts boolean noIndex values', (toc) => {
        expect(validate(toc)).toBe(true);
    });

    it.each([{noIndex: 'true'}, {items: [{name: 'Private page', href: 'private.md', noIndex: 1}]}])(
        'rejects non-boolean noIndex values',
        (toc) => {
            expect(validate(toc)).toBe(false);
        },
    );
});
