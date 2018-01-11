const path = require('path');
const { toCamelCase } = require('strman');
const rollupBabel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const json = require('rollup-plugin-json');
const uglify = require('rollup-plugin-uglify');
const nodeBuiltIns = require('rollup-plugin-node-builtins');
const nodeGlobals = require('rollup-plugin-node-globals');
const { pkg, hasFile, hasPkgProp, parseEnv, ifFile } = require('../../utils');

const here = p => path.join(__dirname, p);
const capitalize = s => s[0].toUpperCase() + s.slice(1);

const format = process.env.BUNDLE_FORMAT;
const outputDir = process.env.BUNDLE_OUTPUT_DIR || 'dist';
const minify = parseEnv('BUNDLE_MINIFY', false);
const sourcemap = parseEnv('BUNDLE_SOURCEMAP', false);
const isNode = parseEnv('BUNDLE_NODE', false);
const name = process.env.BUNDLE_NAME || capitalize(toCamelCase(pkg.name));
const peerDeps = pkg.peerDependencies || {};
const isEsm = format === 'esm';

const input =
  process.env.BUNDLE_INPUT ||
  ifFile(`src/${format}-entry.js`, `src/${format}-entry.js`, 'src/index.js');

const globals = Object.keys(peerDeps).reduce(
  (deps, dep) => ({
    ...deps,
    [dep]: capitalize(toCamelCase(dep)),
  }),
  [],
);

const external = Object.keys(peerDeps);

const filename = [pkg.name, `.${format}`, minify ? '.min' : null, '.js']
  .filter(Boolean)
  .join('');

const file = path.join(outputDir, filename);

const output = {
  file,
  name,
  format: isEsm ? 'es' : format,
  globals,
  sourcemap,
};

const useBuiltinConfig = !hasFile('.babelrc') && !hasPkgProp('babel');
const babelPresets = useBuiltinConfig ? [here('../build/babel.config.js')] : [];

module.exports = {
  input,
  output,
  external,
  plugins: [
    isNode ? nodeBuiltIns() : null,
    isNode ? nodeGlobals() : null,
    nodeResolve({ preferBuiltins: isNode, jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' }),
    json(),
    rollupBabel({
      exclude: 'node_modules/**',
      presets: babelPresets,
      babelrc: true,
    }),
    minify ? uglify() : null,
  ].filter(Boolean),
};
