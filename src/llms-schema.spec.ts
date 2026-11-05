import {describe, expect, it} from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import {tocSchemaJson, yfmSchemaJson} from './index';

describe('LLMS metadata', () => {
    const ajv = new Ajv({strict: false, allowUnionTypes: true});
    addFormats(ajv);
    const validateToc = ajv.compile(tocSchemaJson);
    const validateYfm = ajv.compile(yfmSchemaJson);

    it('accepts per-TOC description, details and URL overrides', () => {
        expect(
            validateToc({
                llms: {
                    description: 'Localized summary',
                    details: 'Additional details.\n\n- A list item.',
                    url: 'https://example.com/en/llms.txt',
                },
            }),
        ).toBe(true);
    });

    it('accepts partial and empty TOC metadata to clear project defaults', () => {
        expect(validateToc({llms: {}})).toBe(true);
        expect(validateToc({llms: {description: '', details: '', url: ''}})).toBe(true);
    });

    it.each(['description', 'details', 'url'])('rejects invalid TOC %s', (field) => {
        for (const value of [null, 42, false, {}, []]) {
            expect(validateToc({llms: {[field]: value}})).toBe(false);
        }
    });

    it('rejects malformed TOC URLs', () => {
        expect(validateToc({llms: {url: 'not a URL'}})).toBe(false);
    });

    it('keeps enablement and size limits at project level', () => {
        expect(validateToc({llms: {enabled: true}})).toBe(false);
        expect(validateToc({llms: {llmsFullMaxSize: '4M'}})).toBe(false);
    });

    it('accepts project details and rejects non-text details', () => {
        expect(validateYfm({llms: {details: 'Project details.'}})).toBe(true);
        expect(validateYfm({llms: {details: ''}})).toBe(true);
        expect(validateYfm({llms: {details: {text: 'Details'}}})).toBe(false);
        expect(validateYfm({llms: {details: null}})).toBe(false);
    });
});
