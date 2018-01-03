if (process.argv.includes('--debug')) {
  process.env.DEBUG = process.env.DEBUG || 'frans:*';
}

const sade = require('sade');
const { toPairs, forEach, map, prop } = require('ramda');
const dbg = require('debug');
const { setScriptEnv } = require('./utils');
const defaults = require('./defaults');

const debug = dbg('frans:init');
const error = dbg('frans:error');

const handleError = err => {
  if (process.env.DEBUG) {
    error('%O', err);
  } else {
    console.error('An error occured. Run again with flag "--debug" to debug');
    console.error(`Error message: ${err.message}`);
  }

  process.exitCode = typeof err.code === 'number' ? err.code : 1;
};

const wrapAction = action => args =>
  Promise.resolve()
    .then(() => action(args))
    .then(res => {
      debug('Command executed succesfully');
      debug('Result: %O', res);
    })
    .catch(handleError);

const attachCommand = cli => ([command, { config, description }]) => {
  debug(`Setup action handler for script ${command}`);
  debug(`With config: ${config}`);
  debug(`With description: ${description}`);

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
  try {
    debug(`Initialize cli with name "${name}"`);
    const cli = sade(name);

    cli.version(version).describe(description);
    attachCommands(cli, actions);

    cli.parse(process.argv);
    debug('Cli initialized');
  } catch (err) {
    handleError(err);
  }
}

module.exports = fransScripts;
