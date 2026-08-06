import {dump} from 'js-yaml';

import buildManifestJson from './json/build-manifest-schema.json';
import frontmatterJson from './json/frontmatter-schema.json';
import leadingJson from './json/leading-schema.json';
import pageConstructorJson from './json/page-constructor-schema.json';
import presetsJson from './json/presets-schema.json';
import redirectsJson from './json/redirects-schema.json';
import themeJson from './json/theme-schema.json';
import tocJson from './json/toc-schema.json';
import yfmJson from './json/yfm-schema.json';
import yfmlintJson from './json/yfmlint-schema.json';
import buildManifestYaml from './yaml/build-manifest-schema.yaml';
import frontmatterYaml from './yaml/frontmatter-schema.yaml';
import presetsYaml from './yaml/presets-schema.yaml';
import redirectsYaml from './yaml/redirects-schema.yaml';
import themeYaml from './yaml/theme-schema.yaml';
import tocYaml from './yaml/toc-schema.yaml';
import yfmYaml from './yaml/yfm-schema.yaml';
import yfmlintYaml from './yaml/yfmlint-schema.yaml';
import {bundleFrontmatterSchema} from './utils';

export type Schema = Record<string, unknown>;

const bundledLeadingJson = bundleFrontmatterSchema(leadingJson, frontmatterJson);
const bundledPageConstructorJson = bundleFrontmatterSchema(pageConstructorJson, frontmatterJson);

export const buildManifestSchemaJson: Schema = buildManifestJson;
export const frontmatterSchemaJson: Schema = frontmatterJson;
export const leadingSchemaJson: Schema = bundledLeadingJson;
export const pageConstructorSchemaJson: Schema = bundledPageConstructorJson;
export const presetsSchemaJson: Schema = presetsJson;
export const redirectsSchemaJson: Schema = redirectsJson;
export const themeSchemaJson: Schema = themeJson;
export const tocSchemaJson: Schema = tocJson;
export const yfmSchemaJson: Schema = yfmJson;
export const yfmlintSchemaJson: Schema = yfmlintJson;

export const buildManifestSchemaYaml: string = buildManifestYaml;
export const frontmatterSchemaYaml: string = frontmatterYaml;
export const leadingSchemaYaml: string = dump(bundledLeadingJson);
export const pageConstructorSchemaYaml: string = dump(bundledPageConstructorJson);
export const presetsSchemaYaml: string = presetsYaml;
export const redirectsSchemaYaml: string = redirectsYaml;
export const themeSchemaYaml: string = themeYaml;
export const tocSchemaYaml: string = tocYaml;
export const yfmSchemaYaml: string = yfmYaml;
export const yfmlintSchemaYaml: string = yfmlintYaml;
