const winston = require('winston');
const fs = require('fs');
const path = require('path');
const arrify = require('arrify');
const has = require('lodash.has');
const readPkgUp = require('read-pkg-up');
const which = require('which');
const spawn = require('cross-spawn');
const R = require('ramda');
const { toSnakeCase, toUpperCase } = require('strman');

const { pkg, path: pkgPath } = readPkgUp.sync({
  cwd: fs.realpathSync(process.cwd()),
});
const appDirectory = path.dirname(pkgPath);

// eslint-disable-next-line complexity
function resolveBin(
  modName,
  { executable = modName, cwd = process.cwd() } = {},
) {
  let pathFromWhich;
  try {
    pathFromWhich = fs.realpathSync(which.sync(executable));
  } catch (_error) {
    // ignore _error
  }

  try {
    const modPkgPath = require.resolve(`${modName}/package.json`);
    const modPkgDir = path.dirname(modPkgPath);
    const { bin } = require(modPkgPath);
    const binPath = typeof bin === 'string' ? bin : bin[executable];
    const fullPathToBin = path.join(modPkgDir, binPath);
    if (fullPathToBin === pathFromWhich) {
      return executable;
    }
    return fullPathToBin.replace(cwd, '.');
  } catch (error) {
    if (pathFromWhich) {
      return executable;
    }
    throw error;
  }
}

function resolveFransScripts() {
  if (pkg.name === 'frans-scripts') {
    return require.resolve('../bin.js').replace(process.cwd(), '.');
  }

  return resolveBin('frans-scripts');
}

const fromRoot = (...p) => path.join(appDirectory, ...p);
const hasFile = (...p) => fs.existsSync(fromRoot(...p));
const ifFile = (files, t, f) =>
  arrify(files).some(file => hasFile(file)) ? t : f;

const hasPkgProp = props => arrify(props).some(prop => has(pkg, prop));

const hasPkgSubProp = pkgProp => props =>
  hasPkgProp(arrify(props).map(p => `${pkgProp}.${p}`));

const ifPkgSubProp = pkgProp => (props, t, f) =>
  hasPkgSubProp(pkgProp)(props) ? t : f;

const hasScript = hasPkgSubProp('scripts');
const hasPeerDep = hasPkgSubProp('peerDependencies');
const hasDep = hasPkgSubProp('dependencies');
const hasDevDep = hasPkgSubProp('devDependencies');
const hasAnyDep = args => [hasDep, hasDevDep, hasPeerDep].some(fn => fn(args));

const ifPeerDep = ifPkgSubProp('peerDependencies');
const ifDep = ifPkgSubProp('dependencies');
const ifDevDep = ifPkgSubProp('devDependencies');
const ifAnyDep = (deps, t, f) => (hasAnyDep(arrify(deps)) ? t : f);
const ifScript = ifPkgSubProp('scripts');

function envIsSet(name) {
  return (
    process.env.hasOwnProperty(name) && // eslint-disable-line
    process.env[name] &&
    process.env[name] !== 'undefined'
  );
}

function parseEnv(name, def) {
  if (envIsSet(name)) {
    return JSON.parse(process.env[name]);
  }
  return def;
}

function getConcurrentlyArgs(scripts, { killOthers = true } = {}) {
  const colors = [
    'bgBlue',
    'bgGreen',
    'bgMagenta',
    'bgCyan',
    'bgWhite',
    'bgRed',
    'bgBlack',
    'bgYellow',
  ];

  // eslint-disable-next-line
  scripts = Object.entries(scripts).reduce((all, [name, script]) => {
    if (script) {
      return Object.assign({}, all, { [name]: script });
    }
    return all;
  }, {});

  const prefixColors = Object.keys(scripts)
    .reduce(
      (pColors, _s, i) =>
        pColors.concat([`${colors[i % colors.length]}.bold.reset`]),
      [],
    )
    .join(',');

  // prettier-ignore
  return [
    killOthers ? '--kill-others-on-fail' : null,
    '--prefix', '[{name}]',
    '--names', Object.keys(scripts).join(','),
    '--prefix-colors', prefixColors,
    ...Object.values(scripts).map(s => JSON.stringify(s)), // stringify escapes quotes ✨
  ].filter(Boolean)
}

const getPackageManagerBin = () => {
  try {
    resolveBin('yarn');
  } catch (err) {
    return 'npm';
  }

  if (hasFile('yarn.lock')) return 'yarn';
  return 'npm';
};

/* Added after refactor */

const assureAsync = action => (...args) =>
  Promise.resolve().then(() => action(...args));

const wrapAsyncCliAction = action => async (...args) => {
  try {
    const asyncAction = assureAsync(action);
    await asyncAction(...args);
  } catch (err) {
    winston.error(err);
    process.exitCode = err.code || 1;
  }
};

const asyncSpawn = (bin, args, opts = { stdio: 'inherit' }) => {
  const cp = spawn(bin, args, opts);
  const promise = new Promise((resolve, reject) => {
    cp.on('close', code => {
      if (code > 0) return reject(code);
      return resolve();
    });
  });

  Object.defineProperty(promise, 'cp', { value: cp });

  return promise;
};

const reformatFlags = (flags, ignore = []) => {
  const skip = ['_', ...ignore];
  return R.pipe(
    R.omit(skip),
    R.toPairs,
    R.map(([flag, val]) => {
      const dash = flag.length > 1 ? '--' : '-';
      const no = !val ? 'no-' : '';
      const isBool = R.is(Boolean, val);
      return [dash + no + flag, isBool ? null : val].filter(Boolean);
    }),
    R.flatten,
  )(flags);
};

const toConstant = R.pipe(toSnakeCase, toUpperCase);

const setScriptEnv = cmd => {
  const envName = toConstant(`scripts ${cmd}`);
  process.env[envName] = true;
};

module.exports = {
  appDirectory,
  envIsSet,
  fromRoot,
  getConcurrentlyArgs,
  hasFile,
  hasPkgProp,
  hasScript,
  ifAnyDep,
  ifDep,
  ifDevDep,
  ifFile,
  ifPeerDep,
  ifScript,
  parseEnv,
  pkg,
  resolveBin,
  resolveFransScripts,
  getPackageManagerBin,
  wrapAsyncCliAction,
  asyncSpawn,
  reformatFlags,
  toConstant,
  setScriptEnv,
};
