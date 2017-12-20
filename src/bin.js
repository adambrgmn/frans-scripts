#!/usr/bin/env node
const fransScripts = require('./index');

let shouldThrow;
try {
  shouldThrow =
    require(`${process.cwd()}/package.json`).name === 'frans-scripts' &&
    Number(process.version.slice(1).split('.')[0]) < 8;
} catch (error) {
  // ignore
}

if (shouldThrow) {
  throw new Error(
    'You must use Node version 8 or greater to run the scripts within frans-scripts ' +
      'because we dogfood the untranspiled version of the scripts.',
  );
}

fransScripts();
