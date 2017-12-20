const Listr = require('listr');
const isCI = require('is-ci');
const { asyncSpawn, resolveFransScripts } = require('../utils');

async function spawn(bin, args) {
  const proc = asyncSpawn(bin, args, {
    shell: true,
    env: { ...process.env, FORCE_COLOR: !isCI },
  });

  const out = [];

  proc.cp.stderr.on('data', d => out.push(d.toString()));
  proc.cp.stdout.on('data', d => out.push(d.toString()));

  return proc.catch(() => {
    throw new Error(out.join(''));
  });
}

async function validate() {
  const fs = resolveFransScripts();

  const tasks = new Listr([
    {
      title: 'Run lint',
      task: () => spawn(fs, ['lint']),
    },
    {
      title: 'Run test',
      task: () =>
        spawn(fs, ['test', '--silent', '--no-watch', '--passWithNoTests']),
    },
    {
      title: 'Run build',
      task: () => spawn(fs, ['build']),
    },
  ]);

  await tasks.run();
}

module.exports = validate;
