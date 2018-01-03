const fs = require('fs');
const path = require('path');
const arrify = require('arrify');
const readPkgUp = require('read-pkg-up');
const which = require('which');
const R = require('ramda');
const { toSnakeCase, toUpperCase } = require('strman');

const { pkg, path: pkgPath } = readPkgUp.sync({
  cwd: fs.realpathSync(process.cwd()),
});

const appDirectory = path.dirname(pkgPath);

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

    const exec = fullPathToBin.replace(cwd, '.');
    return exec;
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
const hasFile = (...p) => {
  try {
    fs.accessSync(fromRoot(...p), fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
};

const ifFile = (files, t, f) =>
  arrify(files).some(file => hasFile(file)) ? t : f;

const hasPkgProp = props => arrify(props).some(prop => R.has(prop, pkg));

const hasPkgSubProp = pkgProp => {
  const p = R.prop(pkgProp, pkg);

  if (R.isNil(p)) return R.F;
  return props => arrify(props).some(prop => R.has(prop, p));
};

const ifPkgSubProp = pkgProp => (props, t, f) =>
  hasPkgSubProp(pkgProp)(props) ? t : f;

const hasDep = hasPkgSubProp('dependencies');
const hasDevDep = hasPkgSubProp('devDependencies');
const hasPeerDep = hasPkgSubProp('peerDependencies');
const hasAnyDep = args => [hasDep, hasDevDep, hasPeerDep].some(fn => fn(args));

const ifDep = ifPkgSubProp('dependencies');
const ifDevDep = ifPkgSubProp('devDependencies');
const ifPeerDep = ifPkgSubProp('peerDependencies');
const ifAnyDep = (deps, t, f) => (hasAnyDep(arrify(deps)) ? t : f);

const toConstant = R.pipe(toSnakeCase, toUpperCase);

function envIsSet(name) {
  return (
    process.env.hasOwnProperty.call(process.env, name) &&
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

const setScriptEnv = cmd => {
  const envName = toConstant(`scripts ${cmd}`);
  process.env[envName] = true;
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

module.exports = {
  pkg,
  pkgPath,
  appDirectory,
  resolveBin,
  resolveFransScripts,
  fromRoot,
  hasFile,
  ifFile,
  hasPkgProp,
  hasPkgSubProp,
  ifPkgSubProp,
  hasDep,
  hasDevDep,
  hasPeerDep,
  hasAnyDep,
  ifDep,
  ifDevDep,
  ifPeerDep,
  ifAnyDep,
  toConstant,
  envIsSet,
  parseEnv,
  setScriptEnv,
  reformatFlags,
};
