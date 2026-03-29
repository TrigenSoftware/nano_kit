# @nano_kit/next-router

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/next-router.svg
[npm-url]: https://npmjs.com/package/@nano_kit/next-router

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/next-router
[deps-url]: https://libraries.io/npm/@nano_kit/next-router

[size]: https://deno.bundlejs.com/badge?q=@nano_kit/next-router
[size-url]: https://bundlejs.com/?q=@nano_kit/next-router

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

Next.js integration for [@nano_kit/router](../router). Provides navigation primitives for both client components and React Server Components, a router-aware `<Link>` component, and helpers for the Pages Router.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/router @nano_kit/react @nano_kit/next-router
# or
npm install @nano_kit/store @nano_kit/router @nano_kit/react @nano_kit/next-router
# or
yarn add @nano_kit/store @nano_kit/router @nano_kit/react @nano_kit/next-router
```

## Quick Start

### App Router

#### Layout (RSC)

Wrap the app with `NextNavigation` — it sets up navigation on the server and hydrates on the client:

```tsx
// app/layout.tsx
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'

// Define global types for routes
declare module '@nano_kit/router' {
  interface AppContext {
    routes: typeof routes
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextNavigation routes={routes}>
      <html lang="en">
        <body>
          <Nav />
          {children}
        </body>
      </html>
    </NextNavigation>
  )
}
```

#### Client Component

Use the router-aware `Link`:

```tsx
'use client'
import { Link } from '@nano_kit/next-router'

export function Nav() {
  return (
    <nav>
      <Link to='characters'>Characters</Link>
      <Link to='episodes'>Episodes</Link>
      <Link to='character' params={{ id: '42' }}>Rick</Link>
    </nav>
  )
}
```

#### Page with Stores (RSC)

Use `Dehydration` to prefetch store data on the server and hydrate it on the client. Each `Dehydration` must be directly wrapped in its own `NextNavigation` — during client-side navigations ("flight" requests) Next.js only renders the requested page segment, not the root layout, so stores need their own navigation context:

```tsx
// app/characters/page.tsx
import { Dehydration } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import { CharactersPage, Stores$ } from '@/ui/pages/Characters'

export default function Page() {
  return (
    <NextNavigation routes={routes}>
      <Dehydration stores={Stores$}>
        <CharactersPage />
      </Dehydration>
    </NextNavigation>
  )
}
```

### Pages Router

#### Layout

Use `NextNavigationProvider` in `_app.tsx`:

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { HydrationProvider } from '@nano_kit/react'
import { NextNavigationProvider } from '@nano_kit/next-router'
import { routes } from '@/stores/router'

// Define global types for routes
declare module '@nano_kit/router' {
  interface AppContext {
    routes: typeof routes
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextNavigationProvider routes={routes}>
      <HydrationProvider dehydrated={pageProps.dehydrated}>
        <Component {...pageProps} />
      </HydrationProvider>
    </NextNavigationProvider>
  )
}
```

#### Page with SSR

Use `virtualNavigationContext` and `dehydrate` in `getServerSideProps` to prefetch data on the server:

```tsx
// pages/characters.tsx
import type { GetServerSideProps } from 'next'
import { dehydrate } from '@nano_kit/store'
import { virtualNavigationContext } from '@nano_kit/router'
import { routes } from '@/stores/router'
import { CharactersPage, Stores$ } from '@/ui/pages/Characters'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const dehydrated = await dehydrate(
    Stores$,
    virtualNavigationContext(context.resolvedUrl, routes)
  )

  return { props: { dehydrated } }
}

export default function Page() {
  return <CharactersPage />
}
```

## Documentation

For comprehensive guides, API reference, and integration patterns, visit the [documentation website](https://nano-kit.js.org/integrations/next-router).
