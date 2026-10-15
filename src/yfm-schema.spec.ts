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
