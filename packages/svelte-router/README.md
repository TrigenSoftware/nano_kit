# @nano_kit/svelte-router

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/%40nano_kit%2Fsvelte-router.svg
[npm-url]: https://npmjs.com/package/@nano_kit/svelte-router

[deps]: https://img.shields.io/librariesio/release/npm/%40nano_kit%2Fsvelte-router
[deps-url]: https://libraries.io/npm/%40nano_kit/svelte-router

[size]: https://deno.bundlejs.com/badge?q=%40nano_kit%2Fsvelte-router
[size-url]: https://bundlejs.com/?q=%40nano_kit%2Fsvelte-router

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

The `@nano_kit/svelte-router` package provides Svelte integration for [@nano_kit/router](../router). It allows you to use the router's powerful features like code splitting, dependency injection, and state management directly within your Svelte application.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/router @nano_kit/svelte @nano_kit/svelte-router svelte
# or
npm install @nano_kit/store @nano_kit/router @nano_kit/svelte @nano_kit/svelte-router svelte
# or
yarn add @nano_kit/store @nano_kit/router @nano_kit/svelte @nano_kit/svelte-router svelte
```

## Quick Start

Basically, `@nano_kit/svelte-router` re-exports everything from `@nano_kit/router`, so you can use all base router functions:

```ts
import { browserNavigation, getPageSignal, layout, loadable, page, router } from '@nano_kit/svelte-router'
import MainLayout from './MainLayout.svelte'
import Loader from './Loader.svelte'

/* Define routes config */
const routes = {
  home: '/',
  user: '/users/:id'
} as const

/* Create navigation */
const [$location, navigation] = browserNavigation(routes)

/* Create page signal */
const $page = router($location, [
  layout(MainLayout, [
    page('home', loadable(() => import('./Home.svelte'), Loader)),
    page('user', loadable(() => import('./User.svelte'), Loader))
  ])
])

export const Page = getPageSignal($page)
```

```svelte
<!-- App.svelte -->
<script lang="ts">
  import '@nano_kit/svelte'
  import { Page } from './router.js'
</script>

{#if $Page}
  {@const CurrentPage = $Page}
  <CurrentPage />
{/if}
```

In `MainLayout`, use `Outlet` to render the matched child page:

```svelte
<!-- MainLayout.svelte -->
<script lang="ts">
  import { Outlet } from '@nano_kit/svelte-router'
</script>

<main>
  <Outlet />
</main>
```

## Documentation

For comprehensive guides, API reference, and integration patterns, visit the [documentation website](https://nano-kit.js.org/integrations/svelte-router).
