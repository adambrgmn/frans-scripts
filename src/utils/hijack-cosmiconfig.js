const path = require('path');
const { promisify } = require('util');
const resolve = promisify(require('resolve'));

async function hijackCosmiconfig(forPackage, configPath, prop = forPackage) {
  const pkgPath = require.resolve(forPackage);
  const cosmiconfigPath = await resolve('cosmiconfig', {
    basedir: path.dirname(pkgPath),
  });

  const realCosmiconfig = require(cosmiconfigPath);

  function fakeCosmiconfig(...args) {
    if (args[0] === prop) {
      return { load: () => Promise.resolve({ config: require(configPath) }) };
    }

    return realCosmiconfig(...args);
  }

  require.cache[cosmiconfigPath] = { exports: fakeCosmiconfig };
}

module.exports = hijackCosmiconfig;
