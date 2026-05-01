# @nano_kit/svelte

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/%40nano_kit%2Fsvelte.svg
[npm-url]: https://npmjs.com/package/@nano_kit/svelte

[deps]: https://img.shields.io/librariesio/release/npm/%40nano_kit%2Fsvelte
[deps-url]: https://libraries.io/npm/%40nano_kit/svelte

[size]: https://deno.bundlejs.com/badge?q=%40nano_kit%2Fsvelte
[size-url]: https://bundlejs.com/?q=%40nano_kit%2Fsvelte

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

The `@nano_kit/svelte` package integrates [@nano_kit/store](../store) signals and dependency injection with Svelte.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/svelte svelte
# or
npm install @nano_kit/store @nano_kit/svelte svelte
# or
yarn add @nano_kit/store @nano_kit/svelte svelte
```

## Quick Start

Import `@nano_kit/svelte` once to make Nano Kit signals compatible with Svelte stores:

```svelte
<script lang="ts">
  import '@nano_kit/svelte'
  import { signal } from '@nano_kit/store'

  const count = signal(0)
</script>

<button onclick={() => count(c => c + 1)}>
  Count: {$count}
</button>
```

Writable signals also get a Svelte-compatible `set` method:

```svelte
<script lang="ts">
  import '@nano_kit/svelte'
  import { signal } from '@nano_kit/store'

  const count = signal(0)
</script>

<button onclick={() => count.set($count + 1)}>
  Count: {$count}
</button>
```

## Documentation

For comprehensive guides, API reference, and integration patterns, visit the [documentation website](https://nano-kit.js.org/integrations/svelte).
