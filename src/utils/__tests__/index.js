/* eslint-disable no-underscore-dangle */
import * as path from 'path';
import fs from 'fs';
import which from 'which';
import * as utils from '../index';

jest.mock('fs');
jest.mock('which');

beforeEach(() => {
  jest.resetAllMocks();
  jest.resetModules();
});

test('utils.resolveBin', () => {
  which.__setShouldThrow(false);
  expect(utils.resolveBin('npm')).toBe('npm');

  which.__setShouldThrow(true);
  expect(() => utils.resolveBin('no-existing-module')).toThrow();
  expect(utils.resolveBin('eslint')).toBe(
    './node_modules/eslint/bin/eslint.js',
  );

  expect(utils.resolveBin('babel-cli', { executable: 'babel' })).toBe(
    './node_modules/babel-cli/bin/babel.js',
  );
});

test('utils.fromRoot', () => {
  expect(utils.fromRoot('file.md')).toBe(
    path.join(utils.appDirectory, 'file.md'),
  );

  expect(utils.fromRoot('dir', 'file.md')).toBe(
    path.join(utils.appDirectory, 'dir', 'file.md'),
  );
});

test('utils.hasFile', () => {
  fs.__setAccessShouldThrow(false);
  expect(utils.hasFile('test.md')).toBe(true);

  fs.__setAccessShouldThrow(true);
  expect(utils.hasFile('no-file.md')).toBe(false);
});

test('utils.ifFile', () => {
  fs.__setAccessShouldThrow(false);
  expect(utils.ifFile('test.md', 'true', 'false')).toBe('true');

  fs.__setAccessShouldThrow(true);
  expect(utils.ifFile('test.md', 'true', 'false')).toBe('false');
  expect(utils.ifFile(['test.md', 'test2.md'], 'true', 'false')).toBe('false');

  fs.__setAccessShouldThrow(false);
  expect(utils.ifFile(['test.md', 'test2.md'], 'true', 'false')).toBe('true');
});

test('utils.hasPkgProp', () => {
  expect(utils.hasPkgProp('prop')).toBe(false);
  expect(utils.hasPkgProp('dependencies')).toBe(true);
  expect(utils.hasPkgProp(['prop', 'dependencies'])).toBe(true);
});

test('utils.hasPkgSubProp', () => {
  const hasConfigProp = utils.hasPkgSubProp('config');

  expect(hasConfigProp('foo')).toBe(true);
  expect(hasConfigProp('bar')).toBe(false);
  expect(hasConfigProp(['bar', 'baz'])).toBe(false);
  expect(hasConfigProp(['foo', 'bar'])).toBe(true);

  const hasFooProp = utils.hasPkgSubProp('foo');
  expect(hasFooProp('test')).toBe(false);
});

test('utils.ifPkgSubProp', () => {
  const result = utils.ifPkgSubProp('config')('foo', 'true', 'false');
  expect(result).toBe('true');
});

test('utils.hasDep', () => {
  expect(utils.hasDep('module-a')).toBe(true);
  expect(utils.hasDep('module')).toBe(false);
});

test('utils.hasDevDep', () => {
  expect(utils.hasDevDep('module-c')).toBe(true);
  expect(utils.hasDevDep('module')).toBe(false);
});

test('utils.hasPeerDep', () => {
  expect(utils.hasPeerDep('module-e')).toBe(true);
  expect(utils.hasPeerDep('module')).toBe(false);
});

test('utils.hasAnyDep', () => {
  expect(utils.hasAnyDep('module-a')).toBe(true);
  expect(utils.hasAnyDep('module-c')).toBe(true);
  expect(utils.hasAnyDep('module-e')).toBe(true);
  expect(utils.hasAnyDep('module')).toBe(false);
});

test('utils.ifDep', () => {
  expect(utils.ifDep('module-a', 'true', 'false')).toBe('true');
  expect(utils.ifDep('module', 'true', 'false')).toBe('false');
});

test('utils.ifDevDep', () => {
  expect(utils.ifDevDep('module-c', 'true', 'false')).toBe('true');
  expect(utils.ifDevDep('module', 'true', 'false')).toBe('false');
});

test('utils.ifPeerDep', () => {
  expect(utils.ifPeerDep('module-e', 'true', 'false')).toBe('true');
  expect(utils.ifPeerDep('module', 'true', 'false')).toBe('false');
});

test('utils.ifAnyDep', () => {
  expect(utils.ifAnyDep('module-a', 'true', 'false')).toBe('true');
  expect(utils.ifAnyDep('module-c', 'true', 'false')).toBe('true');
  expect(utils.ifAnyDep('module-e', 'true', 'false')).toBe('true');
  expect(utils.ifAnyDep('module', 'true', 'false')).toBe('false');
});

test('utils.toConstant', () => {
  expect(utils.toConstant('make it constant')).toBe('MAKE_IT_CONSTANT');
});

test('utils.envIsSet', () => {
  const originalEnv = { ...process.env };
  const envVar = 'CUSTOM_ENV';

  let result = utils.envIsSet(envVar);
  expect(result).toBe(false);

  process.env[envVar] = 'value';
  result = utils.envIsSet(envVar);
  expect(result).toBe(true);

  process.env = originalEnv;
});

test('utils.parseEnv', () => {
  const originalEnv = { ...process.env };
  const envVar = 'CUSTOM_ENV';

  let result = utils.parseEnv(envVar, 'val');
  expect(result).toBe('val');

  process.env[envVar] = true;
  result = utils.parseEnv(envVar, false);
  expect(result).toBe(true);

  process.env = originalEnv;
});

test('utils.setScriptEnv', () => {
  const originalEnv = { ...process.env };

  utils.setScriptEnv('custom-command');
  expect(process.env.SCRIPTS_CUSTOM_COMMAND).toBe(true);

  process.env = originalEnv;
});

test('utils.formatFlags', () => {
  const flags = {
    _: ['.'],
    watch: true,
    debug: false,
    a: true,
    config: 'path/to/config',
  };

  const result = utils.reformatFlags(flags);
  expect(result).toEqual([
    '--watch',
    '--no-debug',
    '-a',
    '--config',
    flags.config,
  ]);
});
