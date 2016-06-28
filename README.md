snakeskinify
================

Using [Snakeskin](https://github.com/SnakeskinTpl/Snakeskin) with [Browserify](http://browserify.org).

[![NPM version](http://img.shields.io/npm/v/snakeskinify.svg?style=flat)](http://badge.fury.io/js/snakeskinify)
[![Build Status](http://img.shields.io/travis/SnakeskinTpl/snakeskinify.svg?style=flat&branch=master)](https://travis-ci.org/SnakeskinTpl/snakeskinify)
[![NPM dependencies](http://img.shields.io/david/SnakeskinTpl/snakeskinify.svg?style=flat)](https://david-dm.org/SnakeskinTpl/snakeskinify)
[![NPM devDependencies](http://img.shields.io/david/dev/SnakeskinTpl/snakeskinify.svg?style=flat)](https://david-dm.org/SnakeskinTpl/snakeskinify#info=devDependencies&view=table)
[![NPM peerDependencies](https://david-dm.org/SnakeskinTpl/snakeskinify/peer-status.svg)](https://david-dm.org/SnakeskinTpl/snakeskinify#info=peerDependencies)

## Install

```bash
npm install snakeskinify --save-dev
```

## Setup

When creating your browserify bundle, just add this line:

```js
bundle.transform(require('snakeskinify'));
```

or if you are a command line cowboy, something along the lines of

```js
browserify -t snakeskinify entry.js -o bundle.js
```

## Configuration

As with most browserify transforms, you can configure snakeskinify via the second argument to `bundle.transform`:

```js
bundle.transform(require('snakeskinify'), {prettyPrint: true});
```

or inside your `package.json` configuration:

```json
{
  "name": "my-spiffy-package",
  "browserify": {
    "transform": [
      ["snakeskinify", {"prettyPrint": true}]
    ]
  }
}
```

## [Options](http://snakeskintpl.github.io/docs/api.html#compile--opt_params)
### adapter

Type: `String`

Name of the adaptor, for example:

* [ss2react](https://github.com/SnakeskinTpl/ss2react) compiles Snakeskin for React
* [ss2vue](https://github.com/SnakeskinTpl/ss2vue) compiles Snakeskin for Vue2

### adapterOptions

Type: `Object`

Options for the used adaptor.

### exec

Type: `Boolean`

Default: `false`

If the parameter is set to `true` the template will be launched after compiling and the results of it work will be saved.

### tpl

Type: `String`

The name of the executable template (if is set `exec`), if the parameter is not specified, then uses the rule:

```js
%fileName% || main || index || Object.keys().sort()[0];
```

### data

Type: `?`

Data for the executable template (if is set `exec`).

## [License](https://github.com/SnakeskinTpl/snakeskinify/blob/master/LICENSE)

The MIT License.
