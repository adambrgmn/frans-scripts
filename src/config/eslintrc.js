const { ifAnyDep } = require('../utils');

module.exports = {
  extends: [
    require.resolve('eslint-config-airbnb-base'),
    ifAnyDep('react', require.resolve('eslint-config-airbnb')),
    require.resolve('eslint-config-prettier'),
  ].filter(Boolean),
  rules: {},
};
