# @nano_kit/store

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/store.svg
[npm-url]: https://npmjs.com/package/@nano_kit/store

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/store
[deps-url]: https://libraries.io/npm/@nano_kit%2Fstore

[size]: https://deno.bundlejs.com/badge?q=@nano_kit/store
[size-url]: https://bundlejs.com/?q=@nano_kit/store

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../website/src/assets/star_white.svg">
  <img alt="Four-pointed star logo" src="../../website/src/assets/star_black.svg" width="100" height="100" align="right">
</picture>

A lightweight state management library inspired by [Nano Stores](https://github.com/nanostores/nanostores) and built around [a push-pull based reactivity system](https://github.com/stackblitz/alien-signals).

- **Tiny**. ~2 kB (minified & brotlied). Zero dependencies.
- **Fast**. Optimized for performance using the push-pull algorithm.
- **Tree-Shakeable**. Only the methods you import end up in your bundle.
- **TypeScript**. First-class type support out of the box.

## Installation

```bash
pnpm add @nano_kit/store
# or
npm install @nano_kit/store
# or
yarn add @nano_kit/store
```

## Quick Start

Here is a minimal example demonstrating signals, computed values, and effects in action:

```ts
import { signal, mountable, onMount, computed, effect } from '@nano_kit/store'

/* Create independent mountable atomic store */
const $count = mountable(signal(1))

/* Mountable: Run logic only when store has listeners */
onMount($count, () => {
  console.log('Mounted: Store is active')
  /* e.g., open websocket, start timer, etc. */

  return () => {
    console.log('Unmounted: Store is idle')
    /* e.g., close websocket, stop timer */
  }
})

/* Derive state (computed values are lazy & cached) */
const $double = computed(() => $count() * 2)

/* React to changes (triggers onMount) */
const unsub = effect(() => {
  console.log(`Count: ${$count()}, Double: ${$double()}`)
})
// Output: Count: 1, Double: 2
// Output: Mounted: Store is active

/* Update triggers granular propagation */
$count(2)
// Output: Count: 2, Double: 4

/* Cleanup: removes listener and triggers onMount destructor */
unsub()
// Output: Unmounted: Store is idle
```

## Documentation

For comprehensive guides, advanced patterns, and API reference, visit the [documentation website](https://nano-kit.js.org/store).
