const execa = require('execa');
const isCi = require('is-ci');
const debug = require('debug')('frans:run-script');

const runScript = (bin, args, opts = {}) => {
  debug(`Execute command ${bin}`);
  debug('With args: %o', args);

  const proc = execa(bin, args, {
    stdio: 'inherit',
    ...opts,
    env: { ...process.env, FORCE_COLOR: !isCi, ...opts.env },
  });

  return proc
    .then(res => {
      debug(`Command ${bin} executed succesfully`);
      return res;
    })
    .catch(err => {
      debug(`Command ${bin} got rejected`);
      throw err;
    });
};

module.exports = runScript;
