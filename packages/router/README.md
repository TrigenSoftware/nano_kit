# @nano_kit/router

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/router.svg
[npm-url]: https://npmjs.com/package/@nano_kit/router

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/router
[deps-url]: https://libraries.io/npm/@nano_kit/router

[size]: https://deno.bundlejs.com/badge?q=@nano_kit/router
[size-url]: https://bundlejs.com/?q=@nano_kit/router

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../website/src/assets/ring-system_white.svg">
  <img alt="Four-pointed ring system star logo" src="../../website/src/assets/ring-system_black.svg" width="100" height="100" align="right">
</picture>

A small and powerful router for [@nano_kit/store](../store) state manager.

- **Small**. Around 2 kB (minified & brotlied). Zero dependencies except [@nano_kit/store](../store).
- **Type-safe**. Full TypeScript support with type inference for routes and parameters.
- **Signal-based**. Built on top of [@nano_kit/store](../store)'s reactive signals for automatic UI updates.
- **Flexible**. Supports nested layouts, parameterized routes, optional parameters, wildcards, and query parameters.
- **SSR-ready**. Works seamlessly with server-side rendering.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/router
# or
npm install @nano_kit/store @nano_kit/router
# or
yarn add @nano_kit/store @nano_kit/router
```

## Quick Start

Here is a minimal example demonstrating navigation, routing, and reactive page rendering:

```js
import { effect } from '@nano_kit/store'
import { browserNavigation, router, page, layout, notFound } from '@nano_kit/router'

/* Define your routes */
const routes = {
  home: '/',
  user: '/users/:id',
  userPosts: '/users/:id/posts',
  admin: '/admin/*'
}

/* Setup navigation with browser history */
const [$location, navigation] = browserNavigation(routes)

/* Define page components */
const HomePage = () => 'Welcome Home!'
const UserPage = () => `User ID: ${$location().params.id}`
const UserPostsPage = () => `Posts for User: ${$location().params.id}`
const AdminLayout = ($page) => `Admin Layout: ${$page()}`
const AdminPage = () => `Admin Page: ${$location().params.splat || 'dashboard'}`
const NotFoundPage = () => 'Page Not Found'

/* Create router with pages and layouts */
const [$page] = router($location, [
  page('home', HomePage),
  page('user', UserPage),
  page('posts', UserPostsPage),
  layout(AdminLayout, [
    page('admin', AdminPage)
  ]),
  notFound(NotFoundPage)
], composeLayoutFunction)

/* React to route changes (mounting $page triggers router) */
const unsub = effect(() => {
  const PageComponent = $page()

  console.log('Current page:', PageComponent())
  // Render PageComponent in your app
})
// Output: Current page: Welcome Home!

/* Navigate programmatically */
navigation.push('/users/123')
// Output: Current page: User ID: 123

navigation.push('/admin/settings/profile')
// Output: Current page: Admin Layout: Admin Page: settings/profile

navigation.back()
// Output: Current page: User ID: 123

/* Cleanup */
unsub()
```

## Documentation

For comprehensive guides, advanced patterns, and API reference, visit the [documentation website](https://nano-kit.js.org/router).
