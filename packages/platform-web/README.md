# @nano_kit/platform-web

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/platform-web.svg
[npm-url]: https://npmjs.com/package/@nano_kit/platform-web

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/platform-web
[deps-url]: https://libraries.io/npm/@nano_kit%2Fplatform-web

[size]: https://deno.bundlejs.com/badge?q=@nano_kit/platform-web
[size-url]: https://bundlejs.com/?q=@nano_kit/platform-web

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

Web platform adapters and reactive helpers for [@nano_kit/store](../store).

- **Reactive Web APIs**. Signals for storage, media queries, window properties, permissions, geolocation, cookies, and cross-tab messages.
- **SSR-friendly**. Helpers use fallbacks or lazy browser access where possible.
- **Type-safe**. Codec-aware storage helpers keep app values typed.
- **Tree-Shakeable**. Import only the browser primitives you need.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/platform-web
# or
npm install @nano_kit/store @nano_kit/platform-web
# or
yarn add @nano_kit/store @nano_kit/platform-web
```

## Quick Start

```ts
import {
  BooleanCodec,
  effect
} from '@nano_kit/store'
import {
  $networkOnline,
  $pageVisible,
  broadcasted,
  localStored,
  mediaQuery
} from '@nano_kit/platform-web'

const $dark = localStored('dark', false, BooleanCodec)
const $wide = mediaQuery('(min-width: 768px)', false)
const $authEvent = broadcasted<'logout' | 'refresh'>('auth')

const stop = effect(() => {
  console.log({
    dark: $dark(),
    online: $networkOnline(),
    pageVisible: $pageVisible(),
    wide: $wide()
  })
})

$dark(true)
$authEvent('logout')

stop()
```

## Documentation

For comprehensive guides, advanced patterns, and API reference, visit the [documentation website](https://nano-kit.js.org/platform-web).
