/* eslint-disable import/no-unresolved */
const utils = require('./dist/utils');
const runScript = require('./dist/utils/run-script');
const hijackCosmiconfig = require('./dist/utils/hijack-cosmiconfig');

utils.runScript = runScript;
utils.hijackCosmiconfig = hijackCosmiconfig;

module.exports = utils;
