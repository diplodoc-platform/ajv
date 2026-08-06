import {describe, expect, it} from 'vitest';

import {bundleFrontmatterSchema} from './utils';

const FRONTMATTER_REF = '#/definitions/__frontmatter';

const createSchema = (withDefinitions = true) => ({
    $id: 'https://example.com/schema#',
    type: 'object',
    properties: {
        meta: {
            allOf: [{$ref: 'https://example.com/frontmatter#'}],
            description: 'Page metadata',
        },
    },
    ...(withDefinitions ? {definitions: {Existing: {type: 'string'}}} : {}),
});

const createFrontmatterSchema = () => ({
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://example.com/frontmatter#',
    type: 'object',
    properties: {
        title: {$ref: '#/definitions/TextItems'},
        canonical: {$ref: 'https://example.com/canonical#'},
        nested: {
            items: [{$ref: '#/definitions/TextItems'}, null, 'literal'],
        },
    },
    definitions: {
        TextItems: {
            oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}],
        },
    },
});

type BundledSchema = {
    properties: {
        meta: {
            allOf: {$ref: string}[];
            description: string;
        };
    };
    definitions: {
        Existing?: {type: string};
        __frontmatter: {
            $id?: string;
            $schema?: string;
            properties: {
                title: {$ref: string};
                canonical: {$ref: string};
                nested: {items: [{$ref: string}, null, string]};
            };
        };
    };
};

describe('bundleFrontmatterSchema', () => {
    it('embeds frontmatter, namespaces local references and preserves existing definitions', () => {
        const schema = createSchema();
        const frontmatter = createFrontmatterSchema();
        const originalSchema = structuredClone(schema);
        const originalFrontmatter = structuredClone(frontmatter);

        const result = bundleFrontmatterSchema(schema, frontmatter) as unknown as BundledSchema;

        expect(result.properties.meta).toEqual({
            allOf: [{$ref: FRONTMATTER_REF}],
            description: 'Page metadata',
        });
        expect(result.definitions.Existing).toEqual({type: 'string'});
        expect(result.definitions.__frontmatter).not.toHaveProperty('$id');
        expect(result.definitions.__frontmatter).not.toHaveProperty('$schema');
        expect(result.definitions.__frontmatter.properties.title.$ref).toBe(
            `${FRONTMATTER_REF}/definitions/TextItems`,
        );
        expect(result.definitions.__frontmatter.properties.nested.items).toEqual([
            {$ref: `${FRONTMATTER_REF}/definitions/TextItems`},
            null,
            'literal',
        ]);
        expect(result.definitions.__frontmatter.properties.canonical.$ref).toBe(
            'https://example.com/canonical#',
        );
        expect(schema).toEqual(originalSchema);
        expect(frontmatter).toEqual(originalFrontmatter);
    });

    it('creates definitions when the source schema has none', () => {
        const result = bundleFrontmatterSchema(
            createSchema(false),
            createFrontmatterSchema(),
        ) as unknown as BundledSchema;

        expect(result.definitions.__frontmatter).toBeDefined();
    });

    it.each([{}, {properties: {}}, {properties: {meta: []}}])(
        'rejects a schema without an object properties.meta',
        (schema) => {
            expect(() => bundleFrontmatterSchema(schema, createFrontmatterSchema())).toThrow(
                'Cannot bundle Frontmatter: schema does not define properties.meta',
            );
        },
    );
});
