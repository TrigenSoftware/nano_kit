# @nano_kit/cookie-store

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/cookie-store.svg
[npm-url]: https://npmjs.com/package/@nano_kit/cookie-store

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/cookie-store
[deps-url]: https://libraries.io/npm/@nano_kit/cookie-store

[size]: https://deno.bundlejs.com/badge?q=@nano_kit/cookie-store
[size-url]: https://bundlejs.com/?q=@nano_kit/cookie-store

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

A virutal CookieStore-compatible implementation for SSR and testing environments.

## Installation

```bash
pnpm add @nano_kit/cookie-store
# or
npm install @nano_kit/cookie-store
# or
yarn add @nano_kit/cookie-store
```

## Quick Start

```ts
import { InjectionContext, provide } from '@nano_kit/store'
import {
  CookieStore$,
  VirtualCookieStore
} from '@nano_kit/cookie-store'

const cookieStore = new VirtualCookieStore(
  'theme=dark; session=abc123',
  'https://example.com/dashboard'
)

const context = new InjectionContext([
  provide(CookieStore$, cookieStore)
])

await cookieStore.set({
  name: 'theme',
  value: 'light',
  sameSite: 'lax',
  secure: true
})

const cookie = await cookieStore.get('theme')
// { name: 'theme', value: 'light', path: '/', sameSite: 'lax', secure: true }

const setCookieHeaders = cookieStore.drainSetCookieHeaders()
// ['theme=light; Path=/; SameSite=Lax; Secure']
```

## Documentation

For comprehensive guides, API reference, and integration patterns, visit the [documentation website](https://nano-kit.js.org/ssr/cookies).
