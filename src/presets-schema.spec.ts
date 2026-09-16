import type {ValidateFunction} from 'ajv';

import {beforeAll, describe, expect, it} from 'vitest';
import {load} from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import {presetsSchemaJson, presetsSchemaYaml} from './index';

const presets = {
    default: {
        product: 'Open Single Management Platform',
        company: 'АО "Лаборатория Касперского"',
        forum: 'https://forum.example.com/',
        version: 1.2,
        show_drafts: true,
        tags: ['alpha', 'beta'],
        nested: {
            title: 'Nested title',
            depth: 2,
        },
        i18n: {
            en: {greeting: 'Hello'},
            ru: {greeting: 'Привет'},
        },
    },
    internal: {
        env: 'internal',
    },
};

describe('presets-schema', () => {
    let validate: ValidateFunction;

    beforeAll(() => {
        const ajv = new Ajv({strict: false, allowUnionTypes: true});
        addFormats(ajv);
        validate = ajv.compile(presetsSchemaJson);
    });

    it('yaml source matches the json export', () => {
        expect(load(presetsSchemaYaml)).toEqual(presetsSchemaJson);
    });

    it('accepts string, number, boolean, array and nested object variables', () => {
        expect(validate(presets)).toBe(true);
    });

    it('accepts an empty preset', () => {
        expect(validate({default: {}})).toBe(true);
    });

    it('marks every string variable as translatable', () => {
        // Mirrors how @diplodoc/translation collects XLIFF units:
        // a custom `translate` keyword fires for every string the schema reaches.
        // The `default` preset is visited twice (via `properties` and
        // `patternProperties`), so compare unique values.
        const collected = new Set<string>();
        const ajv = new Ajv({strict: false, allowUnionTypes: true});
        addFormats(ajv);
        ajv.addKeyword({
            keyword: 'translate',
            type: 'string',
            validate: (mode: unknown, data: string) => {
                expect(mode).toBe('md');
                collected.add(data);
                return true;
            },
        });

        const translate = ajv.compile(presetsSchemaJson);

        expect(translate(presets)).toBe(true);
        expect([...collected].sort()).toEqual(
            [
                'Open Single Management Platform',
                'АО "Лаборатория Касперского"',
                'https://forum.example.com/',
                'alpha',
                'beta',
                'Nested title',
                'Hello',
                'Привет',
                'internal',
            ].sort(),
        );
    });
});
