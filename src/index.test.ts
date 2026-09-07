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
    const invalidNoIndexValues = ['true', 1, null, {}, []];

    it.each([true, false])('accepts root noIndex: %s', (noIndex) => {
        expect(validate({noIndex})).toBe(true);
    });

    it.each([true, false])('accepts item noIndex: %s', (noIndex) => {
        expect(validate({items: [{name: 'Page', href: 'page.md', noIndex}]})).toBe(true);
    });

    it.each(invalidNoIndexValues)('rejects root noIndex: %j', (noIndex) => {
        expect(validate({noIndex})).toBe(false);
    });

    it.each(invalidNoIndexValues)('rejects item noIndex: %j', (noIndex) => {
        expect(validate({items: [{name: 'Page', href: 'page.md', noIndex}]})).toBe(false);
    });
});
