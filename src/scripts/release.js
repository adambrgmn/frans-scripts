const { isNil, prop } = require('ramda');
const { toCamelCase } = require('strman');
const winston = require('winston');
const hijackCosmiconfig = require('../utils/hijack-cosmiconfig');

const convertArgs = args => {
  const getProp = p => prop(p, args);
  return Object.keys(args).reduce((acc, key) => {
    const keysProp = getProp(key);

    if (isNil(keysProp)) return acc;
    if (key === '_') return acc;

    return {
      ...acc,
      [toCamelCase(key)]: keysProp,
    };
  }, {});
};

async function contributors(configPath, args) {
  if (configPath != null && typeof configPath !== 'string') {
    throw new Error(
      'If you specify a configPath to command release it must be a string',
    );
  }

  if (configPath) {
    await hijackCosmiconfig('semantic-release', configPath, 'release');
  }

  try {
    const convertedArgs = convertArgs({ ...args, dryRun: true });
    await require('semantic-release')(convertedArgs);
  } catch (err) {
    if (err.message.includes('no new version is released')) {
      winston.info(err.message);
    } else {
      throw err;
    }
  }
}

module.exports = contributors;
