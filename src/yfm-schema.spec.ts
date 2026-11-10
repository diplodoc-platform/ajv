import {describe, expect, it} from 'vitest';
import {load} from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import {yfmSchemaJson, yfmSchemaYaml} from './index';

const ajv = new Ajv({strict: false, allowUnionTypes: true});
addFormats(ajv);
const validate = ajv.compile(yfmSchemaJson);

describe('SVG entity limit configuration', () => {
    it('keeps YAML and generated JSON in sync', () => {
        expect(load(yfmSchemaYaml)).toEqual(yfmSchemaJson);
    });
    it.each([{}, {svgMaxEntityCount: 0}, {svgMaxEntityCount: 1024}])('accepts %j', (content) => {
        expect(validate({content})).toBe(true);
    });
    it.each([-1, 1.5, '1024', true, null, 9007199254740992])('rejects %j', (svgMaxEntityCount) => {
        expect(validate({content: {svgMaxEntityCount}})).toBe(false);
    });
});

describe('external HTTP search configuration', () => {
    it('accepts an endpoint and public query options', () => {
        expect(
            validate({
                search: {
                    provider: 'external',
                    endpoint: 'https://search.example.test/query',
                    options: {version: 'v1', limit: 10, public: true},
                },
            }),
        ).toBe(true);
    });
    it.each([
        '',
        'ftp://search.example.test',
        '//search.example.test',
        'https://user:secret@search.example.test/query',
        '/query#fragment',
    ])('rejects unsupported endpoint %s', (endpoint) => {
        expect(validate({search: {provider: 'external', endpoint}})).toBe(false);
    });
    it('requires an endpoint unless search is disabled', () => {
        expect(validate({search: {provider: 'external'}})).toBe(false);
        expect(validate({search: {provider: 'external', enabled: false}})).toBe(true);
    });
    it.each([[], 'text', null, {nested: {}}, {list: ['v1']}])(
        'rejects invalid options %j',
        (options) => {
            expect(validate({search: {provider: 'external', endpoint: '/query', options}})).toBe(
                false,
            );
        },
    );
});
