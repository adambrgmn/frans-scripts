<div align="center">
<h1>frans-scripts 🛠📦</h1>

<p>CLI toolbox for common scripts for my projects (forked from and inspired by <a href="https://github.com/kentcdodds/kcd-scripts">kcd-scripts</a>)</p>
</div>

<hr />

## The problem

I do a bunch of open source and want to make it easier to maintain so many
projects.

## This solution

This is a CLI that abstracts away all configuration for my open source projects
for linting, testing, building, and more.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

* [Installation](#installation)
* [Usage](#usage)
  * [Overriding Config](#overriding-config)
* [Inspiration](#inspiration)
* [Other Solutions](#other-solutions)
* [Contributors](#contributors)
* [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev frans-scripts
yarn add --dev frans-scripts
```

## Usage

This is a CLI and exposes a bin called `frans-scripts`. I don't really plan on
documenting or testing it super duper well because it's really specific to my
needs. You'll find all available scripts in `src/scripts`.

This project actually dogfoods itself. If you look in the `package.json`, you'll
find scripts with `node src {scriptName}`. This serves as an example of some of
the things you can do with `frans-scripts`.

### Overriding Config

Unlike `react-scripts`, `frans-scripts` allows you to specify your own
configuration for things and have that plug directly into the way things work
with `frans-scripts`. There are various ways that it works, but basically if you
want to have your own config for something, just add the configuration and
`frans-scripts` will use that instead of it's own internal config. In addition,
`frans-scripts` exposes its configuration so you can use it and override only
the parts of the config you need to.

This can be a very helpful way to make editor integration work for tools like
ESLint which require project-based ESLint configuration to be present to work.

So, if we were to do this for ESLint, you could create an `.eslintrc` with the
contents of:

```json
{ "extends": "./node_modules/frans-scripts/eslint.js" }
```

Or, for `babel`, a `.babelrc` with:

```json
{ "presets": ["frans-scripts/babel"] }
```

Or, for `jest`, a `jest.config.js`:

```javascript
const jestConfig = require('frans-scripts/jest');
module.exports = Object.assign(jestConfig, {
  // your overrides here
});
```

Or, for `prettier`, a `prettier.config.js`:

```javascript
const prettierConfig = require('frans-scripts/prettier');
module.exports = Object.assign(prettierConfig, {
  // your overrides here
});
```

> Note: `frans-scripts` intentionally does not merge things for you when you
> start configuring things to make it less magical and more straightforward.
> Extending can take place on your terms. I think this is actually a great way
> to do this.

## Inspiration

This is inspired by `kcd-scripts` and `react-scripts`.

## Other Solutions

I'm not aware of any, if you are please [make a pull request][prs] and add it
here! Again, this is a very specific-to-me solution.

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
| [<img src="https://avatars1.githubusercontent.com/u/13746650?v=4" width="100px;"/><br /><sub><b>Adam Bergman</b></sub>](http://fransvilhelm.com)<br />[💻](https://github.com/adambrgmn/frans-scripts/commits?author=adambrgmn "Code") |
| :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[prs]: http://makeapullrequest.com
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
