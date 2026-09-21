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

describe('yfm interface.markdownActions', () => {
    const ajv = new Ajv({strict: false, allowUnionTypes: true});
    const validate = ajv.compile(schemas.yfmSchemaJson);

    it.each(['visible', 'dropdown', 'none'])('accepts %s', (markdownActions) => {
        expect(validate({interface: {markdownActions}})).toBe(true);
    });

    it('rejects unsupported modes', () => {
        expect(validate({interface: {markdownActions: 'hidden'}})).toBe(false);
    });
});

describe('yfm companions', () => {
    const ajv = new Ajv({strict: false, allowUnionTypes: true});
    const validate = ajv.compile(schemas.yfmSchemaJson);

    it('accepts a boolean value', () => {
        expect(validate({companions: true})).toBe(true);
        expect(validate({companions: false})).toBe(true);
    });

    it('rejects non-boolean values', () => {
        expect(validate({companions: 'true'})).toBe(false);
    });
});
