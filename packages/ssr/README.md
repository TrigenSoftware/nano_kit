# @nano_kit/ssr

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/ssr.svg
[npm-url]: https://npmjs.com/package/@nano_kit/ssr

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/ssr
[deps-url]: https://libraries.io/npm/@nano_kit/ssr

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

A base package for server-side rendering capabilities in Nano Kit.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/router @nano_kit/ssr
# or
npm install @nano_kit/store @nano_kit/router @nano_kit/ssr
# or
yarn add @nano_kit/store @nano_kit/router @nano_kit/ssr
```

## Creating a Render Adapter

`@nano_kit/ssr` is a base package. To use it, you need to create a render adapter for your UI framework — just like `@nano_kit/react-ssr` does for React.

An adapter consists of three parts: a **renderer**, a **client entry**, and a **Vite plugin**.

### 1. Extend the Renderer

Subclass `Renderer` and implement the abstract `renderToString` method. The constructor must receive the framework-specific `compose` function from your router integration and pass it to `super()`.

```js
// src/renderer/index.js
import { Renderer, headDescriptorToHtml, ROOT_ID } from '@nano_kit/ssr/renderer'
import { compose } from 'your-framework-router'
import { get } from '@nano_kit/store'

export class FrameworkRenderer extends Renderer {
  constructor(options) {
    super({ ...options, compose })
  }

  renderToString(data) {
    let lang, dir, title, head = ''

    data.head.forEach((descriptor) => {
      if (descriptor.tag === 'lang') lang = get(descriptor.value) || undefined
      else if (descriptor.tag === 'dir') dir = get(descriptor.value) || undefined
      else if (descriptor.tag === 'title') title = get(descriptor.value) || undefined
      else head += headDescriptorToHtml(descriptor)
    })

    if (title) head = `<title>${title}</title>${head}`

    // render to string using your framework, wrapping with data.injector
    const body = yourFrameworkRenderToString(data.injector)

    return `<html lang="${lang}" dir="${dir}"><head>${head}</head><body><div id="${ROOT_ID}">${body}</div><script>${this.dehydratedScript(data.dehydrated)}</script></body></html>`
  }
}
```

### 2. Create the Client Entry

Wrap the base `ready` function, injecting the framework-specific `router`:

```js
// src/client/index.js
import { router } from 'your-framework-router'
import { ready as baseReady } from '@nano_kit/ssr/client'

export * from '@nano_kit/ssr/client'

export function ready(options) {
  return baseReady({ ...options, router })
}
```

Also provide a **default client template** that the Vite plugin will use when the user does not supply their own:

```jsx
// src/client.js
import { ROOT_ID, ready } from 'your-framework-ssr/client'
import { routes, pages } from 'virtual:app-index'

ready({ routes, pages }).then((injector) => {
  // hydrate the app — framework-specific
  hydrateApp(document.getElementById(ROOT_ID), injector)
})
```

And a **default renderer template**:

```js
// src/renderer.js
import { FrameworkRenderer } from 'your-framework-ssr/renderer'
import { routes, pages } from 'virtual:app-index'

export const renderer = new FrameworkRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  routes,
  pages
})
```

### 3. Create the Vite Plugin

Pass a `SsrPluginAdapter` to the base `SsrPlugin`. The adapter tells the plugin where to find the default client and renderer template files:

```js
// src/vite-plugin/index.js
import path from 'node:path'
import fs from 'node:fs/promises'
import SsrPlugin from '@nano_kit/ssr/vite-plugin'

const adapter = {
  // virtual module IDs used when resolving the templates
  clientPath: 'virtual-client.js',
  rendererPath: 'virtual-renderer.js',

  loadClient() {
    return fs.readFile(path.join(import.meta.dirname, '..', 'client.js'), 'utf-8')
  },
  loadRenderer() {
    return fs.readFile(path.join(import.meta.dirname, '..', 'renderer.js'), 'utf-8')
  }
}

export default function FrameworkSsrPlugin(options) {
  return SsrPlugin(options, adapter)
}
```

The plugin then handles building both the client bundle and the SSR renderer bundle automatically.

### Usage in an app

Once the adapter package is published, end users configure their project like this:

```js
// vite.config.js
import { defineConfig } from 'vite'
import ssr from 'your-framework-ssr/vite-plugin'

export default defineConfig({
  plugins: [ssr({ index: 'src/index.js' })]
})
```

Where `src/index.js` exports the app `routes` and `pages` definition:

```js
// src/index.js
import { page, layout, loadable } from '@nano_kit/router'
import * as Layout from './Layout.js'

export const routes = { home: '/', about: '/about' }

export const pages = [
  layout(Layout, [
    page('home', loadable(() => import('./Home.js'))),
    page('about', loadable(() => import('./About.js')))
  ])
]
```

## Documentation

For comprehensive guides, API reference, and integration patterns, visit the [documentation website](https://nano-kit.js.org/ssr).
