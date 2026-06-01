# @nano_kit/svelte-ssr

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/svelte-ssr.svg
[npm-url]: https://npmjs.com/package/@nano_kit/svelte-ssr

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/svelte-ssr
[deps-url]: https://libraries.io/npm/@nano_kit/svelte-ssr

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

A Svelte adapter for server-side rendering capabilities in Nano Kit.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/router @nano_kit/svelte @nano_kit/svelte-router @nano_kit/svelte-ssr svelte
# or
npm install @nano_kit/store @nano_kit/router @nano_kit/svelte @nano_kit/svelte-router @nano_kit/svelte-ssr svelte
# or
yarn add @nano_kit/store @nano_kit/router @nano_kit/svelte @nano_kit/svelte-router @nano_kit/svelte-ssr svelte
```

## Quick Start

### 1. Define your app

```js
// src/index.js
import { page, layout, loadable } from '@nano_kit/svelte-router'
import Layout from './Layout.svelte'

export const routes = {
  home: '/',
  about: '/about'
}

export const pages = [
  layout(Layout, [
    page('home', loadable(() => import('./Home.svelte'))),
    page('about', loadable(() => import('./About.svelte')))
  ])
]
```

### 2. Set up the Vite plugin

```js
// vite.config.js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import ssr from '@nano_kit/svelte-ssr/vite-plugin'

export default defineConfig({
  plugins: [
    svelte(),
    ssr({
      index: 'src/index.js'
    })
  ]
})
```

The plugin builds both the client bundle and the SSR renderer bundle automatically. By default, it uses the built-in Svelte client and renderer templates.

### 3. Serve with your HTTP server

The plugin produces a `renderer` export from the renderer bundle. Call `renderer.render(url)` to get the HTML for a given URL:

```js
// server.js
import { renderer } from './dist/renderer/index.js'

app.get('*', async (req, res) => {
  const result = await renderer.render(req.url)

  if (result.redirect) {
    return res.redirect(result.statusCode, result.redirect)
  }

  if (result.html !== null) {
    return res.status(result.statusCode).send(result.html)
  }

  res.status(result.statusCode).send('Not Found')
})
```

## Custom Renderer

To customize HTML output, extend `SvelteRenderer` and override `renderToString`:

```ts
// src/renderer.ts
import { SvelteRenderer } from '@nano_kit/svelte-ssr/renderer'
import { routes, pages } from './index.js'

class AppRenderer extends SvelteRenderer {
  renderToString(data) {
    return super.renderToString(data)
  }
}

export const renderer = new AppRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  routes,
  pages
})
```

Then point the plugin to your custom renderer file:

```js
// vite.config.js
ssr({
  index: 'src/index.js',
  renderer: 'src/renderer.ts'
})
```

## Custom Client

To customize client-side hydration, provide your own client entry:

```js
// src/client.js
import { hydrate } from 'svelte'
import { setInjector } from '@nano_kit/svelte'
import { App } from '@nano_kit/svelte-router'
import { ROOT_ID, ready } from '@nano_kit/svelte-ssr/client'
import { routes, pages } from './index.js'

ready({ routes, pages }).then((injector) => {
  hydrate((internals, props) => {
    setInjector(injector)

    return App(internals, props)
  }, {
    target: document.getElementById(ROOT_ID)
  })
})
```

Then point the plugin to your client file:

```js
// vite.config.js
ssr({
  index: 'src/index.js',
  client: 'src/client.js'
})
```

## Documentation

For comprehensive guides, API reference, and integration patterns, visit the [documentation website](https://nano-kit.js.org/svelte-ssr).
