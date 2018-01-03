const execa = require('execa');
const isCi = require('is-ci');

const runScript = (bin, args, opts = {}) => {
  const proc = execa(bin, args, {
    stdio: 'inherit',
    ...opts,
    env: { ...process.env, FORCE_COLOR: !isCi, ...opts.env },
  });

  return proc;
};

module.exports = runScript;
