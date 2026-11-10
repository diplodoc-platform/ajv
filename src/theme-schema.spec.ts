import {describe, expect, it} from 'vitest';
import Ajv from 'ajv';

import {themeSchemaJson} from './index';

describe('theme navigation colors', () => {
    const validate = new Ajv({strict: false}).compile(themeSchemaJson);
    const keys = ['navigation-active-underline', 'navigation-dropdown-selected-background'];

    describe.each(['root', 'light', 'dark'])('%s', (scope) => {
        const theme = (colors: Record<string, unknown>) =>
            scope === 'root' ? colors : {[scope]: colors};

        describe.each(keys)('%s', (key) => {
            it.each(['#123456', 'rgb(10, 20, 30)', 'var(--navigation-color)'])(
                'accepts CSS color %s independently',
                (color) => {
                    expect(validate(theme({[key]: color}))).toBe(true);
                },
            );

            it.each([123, true, null, {}, []])('rejects non-string value %j', (color) => {
                expect(validate(theme({[key]: color}))).toBe(false);
            });
        });

        it('rejects unknown navigation properties', () => {
            expect(validate(theme({'navigation-unknown': '#123456'}))).toBe(false);
        });
    });

    it('accepts independent common colors and theme overrides together', () => {
        expect(
            validate({
                'base-brand': '#005BFF',
                'base-selection': '#EEEEEE',
                'navigation-active-underline': '#123456',
                'navigation-dropdown-selected-background': '#654321',
                light: {
                    'navigation-active-underline': '#112233',
                    'navigation-dropdown-selected-background': '#445566',
                },
                dark: {
                    'navigation-active-underline': '#AABBCC',
                    'navigation-dropdown-selected-background': '#DDEEFF',
                },
            }),
        ).toBe(true);
    });

    it('keeps navigation colors optional for existing themes', () => {
        expect(validate({})).toBe(true);
        expect(validate({'base-brand': '#005BFF', dark: {'base-selection': '#333333'}})).toBe(true);
    });
});
