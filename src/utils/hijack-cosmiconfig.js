const path = require('path');
const { promisify } = require('util');
const resolve = promisify(require('resolve'));
const debug = require('debug')('frans:hijac-cosmiconfig');

async function hijackCosmiconfig(forPackage, configPath, prop = forPackage) {
  debug(`Setup cosmiconfgi hijac for package ${forPackage} and prop ${prop}`);

  const pkgPath = require.resolve(forPackage);
  const cosmiconfigPath = await resolve('cosmiconfig', {
    basedir: path.dirname(pkgPath),
  });

  const realCosmiconfig = require(cosmiconfigPath);

  function fakeCosmiconfig(...args) {
    if (args[0] === prop) {
      return {
        load: () => {
          debug(`Cosmiconfig loaded for ${forPackage}`);
          debug(`With config path ${configPath}`);
          return Promise.resolve({ config: require(configPath) });
        },
      };
    }

    debug('Ignore loading fake cosmiconfig');
    return realCosmiconfig(...args);
  }

  require.cache[cosmiconfigPath] = { exports: fakeCosmiconfig };
  debug(`Cosmiconfig hijacked for package ${forPackage}`);
}

module.exports = hijackCosmiconfig;
