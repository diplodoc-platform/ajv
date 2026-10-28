import type {ValidateFunction} from 'ajv';

import {beforeAll, describe, expect, it} from 'vitest';
import {load} from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import {buildManifestSchemaJson, buildManifestSchemaYaml} from './index';

const minimalFileTrie = {
    tocMapping: {t0: 'toc.yaml'},
    trie: {
        index: {file: {ext: '.md', toc: 't0'}},
    },
};

describe('build-manifest-schema', () => {
    let validate: ValidateFunction;

    beforeAll(() => {
        const ajv = new Ajv({strict: false, allowUnionTypes: true});
        addFormats(ajv);
        validate = ajv.compile(buildManifestSchemaJson);
    });

    it('yaml source matches the json export', () => {
        expect(load(buildManifestSchemaYaml)).toEqual(buildManifestSchemaJson);
    });

    it('accepts a legacy manifest without restrictedAccess', () => {
        expect(
            validate({
                fileTrie: minimalFileTrie,
                yfmConfig: {},
                redirects: {},
            }),
        ).toBe(true);
    });

    it('accepts an RA-aware manifest with empty restrictedAccess', () => {
        expect(
            validate({
                fileTrie: minimalFileTrie,
                yfmConfig: {},
                redirects: {},
                restrictedAccess: {},
            }),
        ).toBe(true);
    });

    it('accepts restrictedAccess rules per page', () => {
        expect(
            validate({
                fileTrie: {
                    tocMapping: {t0: 'toc.yaml'},
                    trie: {
                        index: {file: {ext: '.md', toc: 't0'}},
                        'plugins/index4': {file: {ext: '.md', toc: 't0'}},
                    },
                },
                yfmConfig: {},
                redirects: {},
                restrictedAccess: {
                    index: [['admin']],
                    'plugins/index4': [['admin'], ['customInFile']],
                },
            }),
        ).toBe(true);
    });

    it('accepts openapiCompanions alongside restrictedAccess', () => {
        expect(
            validate({
                fileTrie: minimalFileTrie,
                yfmConfig: {},
                redirects: {},
                restrictedAccess: {},
                openapiCompanions: [
                    {
                        leadingPage: 'ru/api/index',
                        companionPath: 'ru/api/petstore.openapi.json',
                    },
                ],
            }),
        ).toBe(true);
    });

    it('rejects a manifest missing required fields', () => {
        expect(validate({yfmConfig: {}, redirects: {}})).toBe(false);
        expect(validate.errors?.some((error) => error.keyword === 'required')).toBe(true);
    });

    it.each([{}, {index: '2026-10-20T12:00:00.000Z', 'ru/v1.0/guide': '2026-10-21T00:00:00.000Z'}])(
        'accepts optional per-article dates: %j',
        (pageModifiedTimes) => {
            expect(
                validate({
                    fileTrie: minimalFileTrie,
                    yfmConfig: {},
                    redirects: {},
                    pageModifiedTimes,
                }),
            ).toBe(true);
        },
    );

    it.each([{index: 'invalid'}, {index: 123}, {index: '2026-02-30T12:00:00Z'}, null])(
        'rejects invalid article dates: %j',
        (pageModifiedTimes) => {
            expect(
                validate({
                    fileTrie: minimalFileTrie,
                    yfmConfig: {},
                    redirects: {},
                    pageModifiedTimes,
                }),
            ).toBe(false);
        },
    );

    it('rejects invalid restrictedAccess values', () => {
        expect(
            validate({
                fileTrie: minimalFileTrie,
                yfmConfig: {},
                redirects: {},
                restrictedAccess: {index: 'admin'},
            }),
        ).toBe(false);
    });

    it('rejects unknown top-level properties', () => {
        expect(
            validate({
                fileTrie: minimalFileTrie,
                yfmConfig: {},
                redirects: {},
                restrictedAccess: {},
                unknownField: true,
            }),
        ).toBe(false);
    });
});
