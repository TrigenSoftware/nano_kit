# @nano_kit/intl

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/intl.svg
[npm-url]: https://npmjs.com/package/@nano_kit/intl

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/intl
[deps-url]: https://libraries.io/npm/@nano_kit%2Fintl

[size]: https://deno.bundlejs.com/badge?q=@nano_kit/intl
[size-url]: https://bundlejs.com/?q=@nano_kit/intl

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

A lightweight internationalization library for Nano Kit applications.

- **Reactive**. Locale changes update messages through `@nano_kit/store` signals.
- **Type-safe**. Message schemes are checked against translation data.
- **Composable**. Build messages from small formats like `text`, `params`, `plural`, `match`, and `number`.
- **Tree-shakeable**. Import only the formats your app uses.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/intl
# or
npm install @nano_kit/store @nano_kit/intl
# or
yarn add @nano_kit/store @nano_kit/intl
```

## Quick Start

Here is a minimal example with a reactive locale and typed messages:

```ts
import {
  resolved,
  signal
} from '@nano_kit/store'
import {
  intl,
  params,
  plural,
  text
} from '@nano_kit/intl'

const $locale = signal<'en' | 'de'>('en')

const { messages } = intl(
  $locale,
  resolved(() => fetch(`/locales/${$locale()}.json`).then(res => res.json()))
)

const [$t, $loading] = messages('common', {
  title: text(),
  greeting: params({
    name: text()
  }),
  unread: plural('count')
})

/* Text message */
$t().title

/* Parameterized message */
$t().greeting({
  name: 'Ada'
})

/* Pluralized message */
$t().unread({
  count: 5
})

/* Switching locale */
$locale('de')
```

## Documentation

For comprehensive guides, advanced patterns, and API reference, visit the [documentation website](https://nano-kit.js.org/intl).
