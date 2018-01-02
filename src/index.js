const sade = require('sade');
const { toPairs, forEach, map, prop } = require('ramda');
const { setScriptEnv } = require('./utils');
const defaults = require('./defaults');

const wrapAction = action => async args => {
  try {
    await Promise.resolve().then(() => action(args));
  } catch (err) {
    console.error(err.message);
    process.exitCode = typeof err.code === 'number' ? err.code : 1;
  }
};

const attachCommand = cli => ([command, { config, description }]) => {
  const script = require(`./scripts/${command}`);
  const actionHandler = script(config, cli);

  cli
    .command(command)
    .describe(description)
    .action(
      wrapAction(args => {
        setScriptEnv(command);
        return actionHandler(args);
      }),
    );
};

const attachCommands = (cli, actions) => {
  const pairs = toPairs(actions);
  const merged = map(([cmd, opts]) => {
    const defaultOpts = prop(cmd, defaults.actions);
    return [cmd, { ...defaultOpts, ...opts }];
  }, pairs);

  forEach(attachCommand(cli), merged);
};

function fransScripts(
  actions = defaults.actions,
  { name, version, description } = defaults.cliOptions,
) {
  const cli = sade(name);

  cli.version(version).describe(description);
  attachCommands(cli, actions);

  cli.parse(process.argv);
}

module.exports = fransScripts;
