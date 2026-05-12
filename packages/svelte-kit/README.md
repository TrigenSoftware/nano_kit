# @nano_kit/svelte-kit

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@nano_kit/svelte-kit.svg
[npm-url]: https://npmjs.com/package/@nano_kit/svelte-kit

[deps]: https://img.shields.io/librariesio/release/npm/@nano_kit/svelte-kit
[deps-url]: https://libraries.io/npm/@nano_kit/svelte-kit

[size]: https://deno.bundlejs.com/badge?q=@nano_kit/svelte-kit
[size-url]: https://bundlejs.com/?q=@nano_kit/svelte-kit

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/nano_kit/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/nano_kit/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/nano_kit.svg
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/nano_kit

SvelteKit integration for Nano Kit. Provides request-scoped store dehydration, client hydration, SvelteKit-aware navigation, router-aware links, and a server `CookieStore` adapter.

## Installation

```bash
pnpm add @nano_kit/store @nano_kit/router @nano_kit/svelte-kit
# or
npm install @nano_kit/store @nano_kit/router @nano_kit/svelte-kit
# or
yarn add @nano_kit/store @nano_kit/router @nano_kit/svelte-kit
```

## Quick Start

If your stores use navigation, set up server navigation once in the root server layout:

```ts
// src/routes/+layout.server.ts
import { provide } from '@nano_kit/store'
import {
  Location$,
  Navigation$,
  serverNavigation,
  setDehydrationContext
} from '@nano_kit/svelte-kit'
import { routes } from '$lib/routes'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = () => {
  const [location, navigation] = serverNavigation(routes)

  setDehydrationContext([
    provide(Location$, location),
    provide(Navigation$, navigation)
  ])

  return {}
}
```

Set up browser navigation and hydration in the root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { provide } from '@nano_kit/store'
  import {
    Location$,
    Navigation$,
    Link,
    getKitNavigation,
    setHydrationContext
  } from '@nano_kit/svelte-kit'
  import { routes } from '$lib/routes'

  let { children } = $props()
  const [location, navigation] = getKitNavigation(routes)

  setHydrationContext({
    context: [
      provide(Location$, location),
      provide(Navigation$, navigation)
    ]
  })
</script>

<nav>
  <Link to="home">Home</Link>
  <Link to="characters">Characters</Link>
</nav>

{@render children()}
```

Dehydrate page stores in `load` and hydrate them in the page component:

```ts
// src/routes/characters/+page.server.ts
import {
  dehydrate,
  isFlight
} from '@nano_kit/svelte-kit'
import { Stores$ } from '$lib/pages/Characters.svelte'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({
  dehydrated: !isFlight() && await dehydrate(Stores$)
})
```

`isFlight()` skips server dehydration during browser navigation, so stores fetch data directly on the client. Without this check everything still works, but data is prepared on the server for each navigation.

If you want to dehydrate stores on every navigation, wait for the parent layout first when stores depend on navigation provided there:

```ts
// src/routes/characters/+page.server.ts
import { dehydrate } from '@nano_kit/svelte-kit'
import { Stores$ } from '$lib/pages/Characters.svelte'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  await parent()

  return {
    dehydrated: await dehydrate(Stores$)
  }
}
```

```svelte
<!-- src/routes/characters/+page.svelte -->
<script lang="ts">
  import { setHydrationContext } from '@nano_kit/svelte-kit'
  import CharactersPage from '$lib/pages/Characters.svelte'

  let { data } = $props()

  setHydrationContext({
    dehydrated: () => data.dehydrated
  })
</script>

<CharactersPage />
```

Use `Stores$` in the page view to declare stores that should run during SSR:

```svelte
<!-- src/lib/pages/Characters.svelte -->
<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { Characters$ } from '$lib/stores/characters'

  export function Stores$() {
    const { $characters } = inject(Characters$)

    return [$characters]
  }
</script>
```

## Documentation

For full setup guides and API details, visit the [documentation website](https://nano-kit.js.org/integrations/svelte-kit).
