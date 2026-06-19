import {readFileSync} from 'node:fs';
import {defineConfig} from 'vitest/config';

const yamlAsText = {
    name: 'yaml-as-text',
    enforce: 'pre',
    load(id) {
        const path = id.split('?')[0];
        if (path.endsWith('.yaml') || path.endsWith('.yml')) {
            return `export default ${JSON.stringify(readFileSync(path, 'utf8'))};`;
        }
        return null;
    },
};

export default defineConfig({
    plugins: [yamlAsText],
    test: {
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        exclude: ['node_modules', 'build'],
        coverage: {
            enabled: true,
            provider: 'v8',
            include: ['src'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.d.ts'],
        },
    },
});
