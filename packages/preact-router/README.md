# @nano_kit/preact-router

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/preact-router.svg
[npm-url]: https://npmjs.com/package/@nano_kit/preact-router

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/preact-router
[deps-url]: https://libraries.io/npm/@nano_kit/preact-router

[size]: https://deno.bundlejs.com/badge?q=@nano_kit/preact-router
[size-url]: https://bundlejs.com/?q=@nano_kit/preact-router

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

The `@nano_kit/preact-router` package provides Preact integration for [@nano_kit/router](../router). It allows you to use the router's powerful features like code splitting, dependency injection, and state management directly within your Preact application.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/router @nano_kit/preact @nano_kit/preact-router preact
# or
npm install @nano_kit/store @nano_kit/router @nano_kit/preact @nano_kit/preact-router preact
# or
yarn add @nano_kit/store @nano_kit/router @nano_kit/preact @nano_kit/preact-router preact
```

## Quick Start

Basically, `@nano_kit/preact-router` re-exports everything from `@nano_kit/router`, so you can use all base router functions:

```tsx
import { render } from 'preact'
import { browserNavigation, page, layout, loadable, router, Outlet, usePageSignal } from '@nano_kit/preact-router'
import { MainLayout } from './MainLayout'

/* Define routes config */
const routes = {
  home: '/',
  user: '/users/:id'
} as const

/* Create navigation */
const [$location, navigation] = browserNavigation(routes)

/* Define loader fallback */
const Loader = () => <div>Loading...</div>

/* Create page signal */
const $page = router($location, [
  layout(MainLayout, [
    page('home', loadable(() => import('./Home'), Loader)),
    page('user', loadable(() => import('./User'), Loader))
  ])
])

/* Root component */
function App() {
  const Page = usePageSignal($page)

  return Page ? <Page /> : null
}

/* Render App */
render(<App />, document.getElementById('root')!)
```

In `MainLayout`, use `Outlet` to render the matched child page:

```tsx
import { Outlet } from '@nano_kit/preact-router'

export function MainLayout() {
  return (
    <div className="layout">
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

## Documentation

For comprehensive guides, API reference, and integration patterns, visit the [documentation website](https://nano-kit.js.org/integrations/preact-router).
