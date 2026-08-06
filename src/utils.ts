type Schema = Record<string, unknown>;

const FRONTMATTER_DEFINITION = '__frontmatter';
const FRONTMATTER_REF = `#/definitions/${FRONTMATTER_DEFINITION}`;

function isSchema(value: unknown): value is Schema {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clone(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(clone);
    }

    if (isSchema(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    }

    return value;
}

function cloneFrontmatter(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(cloneFrontmatter);
    }

    if (isSchema(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => {
                if (key === '$ref' && typeof item === 'string' && item.startsWith('#/')) {
                    return [key, `${FRONTMATTER_REF}${item.slice(1)}`];
                }

                return [key, cloneFrontmatter(item)];
            }),
        );
    }

    return value;
}

export function bundleFrontmatterSchema<T extends Schema>(schema: T, frontmatterSchema: Schema): T {
    const bundledSchema = clone(schema) as T;
    const properties = bundledSchema.properties;

    if (!isSchema(properties) || !isSchema(properties.meta)) {
        throw new Error('Cannot bundle Frontmatter: schema does not define properties.meta');
    }

    const definitions = isSchema(bundledSchema.definitions) ? bundledSchema.definitions : {};
    const frontmatter = cloneFrontmatter(frontmatterSchema) as Schema;

    delete frontmatter.$id;
    delete frontmatter.$schema;

    return {
        ...bundledSchema,
        properties: {
            ...properties,
            meta: {
                ...properties.meta,
                allOf: [{$ref: FRONTMATTER_REF}],
            },
        },
        definitions: {
            ...definitions,
            [FRONTMATTER_DEFINITION]: frontmatter,
        },
    } as T;
}
