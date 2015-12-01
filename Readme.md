# Acacia

[![Node.js Version][node-image]][node-url]
[![NPM version][npm-image]][npm-url]
[![Dependency Status][dep-image]][dep-url]
[![build status][travis-image]][travis-url]
[![Coverage Status][cov-img]][cov-url]

Minimal Api framework based on [koa](https://github.com/koajs/koa/tree/v2.x) v2.

The goal is to have an api starter kit

## Features

- log via [koa-morgan](https://github.com/koa-modules/morgan)
- cors via [koa-cors](https://github.com/evert0n/koa-cors)
- body parser via [koa-bodyparser](https://github.com/koajs/bodyparser/tree/3.x)
- Routes from directory via [koa-66-aggregate](https://github.com/menems/koa-66-aggregate)
- services helper via [services-stack](https://github.com/menems/services-stack)
- validation via [chain-validation](https://github.com/menems/chain-validator) WIP

## Example

take a look at [acacia-example](https://github.com/menems/acacia-example)

## Test
```bash
$ npm test

```

[node-image]: https://img.shields.io/node/v/acacia.svg?style=flat-square
[node-url]: https://nodejs.org
[npm-image]: https://img.shields.io/npm/v/acacia.svg?style=flat-square
[npm-url]: https://npmjs.org/package/acacia
[travis-image]: https://img.shields.io/travis/menems/acacia/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/menems/acacia
[cov-img]: https://coveralls.io/repos/menems/acacia/badge.svg?branch=master&service=github
[cov-url]: https://coveralls.io/github/menems/acacia?branch=master
[dep-image]: http://david-dm.org/menems/acacia.svg?style=flat-square
[dep-url]:http://david-dm.org/menems/acacia
