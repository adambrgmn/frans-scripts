const sade = require('sade');
const winston = require('winston');
const { toPairs, forEach, map, has, prop } = require('ramda');
const { wrapAsyncCliAction, setScriptEnv } = require('./utils');
const defaults = require('./defaults');

const attachCommand = cli => ([command, { config, description }]) => {
  cli
    .command(command)
    .describe(description)
    .action(
      wrapAsyncCliAction(args => {
        winston.level = has('debug', args) ? 'debug' : 'info';

        setScriptEnv(command);
        const script = require(`./scripts/${command}`);
        return script(config, args);
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
    winston.cli();
    const cli = sade(name);

    cli.version(version).describe(description);
    attachCommands(cli, actions);

    cli.parse(process.argv);
  } catch (err) {
    winston.error(err.message, { error: err });
    process.exitCode = err.code || 1;
  }
}

module.exports = fransScripts;
