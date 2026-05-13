<script lang="ts">
  import { provide } from '@nano_kit/store'
  import {
    enableLinkComponentAriaCurrent,
    getKitNavigation,
    Link,
    Location$,
    Navigation$,
    setHydrationContext
  } from '@nano_kit/svelte-kit'
  import { routes } from '#src/stores/router'
  import '../app.css'

  let { data, children } = $props()
  const [location, navigation] = getKitNavigation(routes)

  setHydrationContext({
    context: [
      provide(Location$, location),
      provide(Navigation$, navigation)
    ]
  }, () => data.serverContext)
  enableLinkComponentAriaCurrent()
</script>

<svelte:head>
  <title>Rick and Morty Wiki</title>
  <meta
    name="description"
    content="Rick and Morty encyclopedia built with SvelteKit and Nano Kit."
  />
</svelte:head>

<div class="main-layout-app">
  <header class="main-layout-header">
    <div class="main-layout-container">
      <h1 class="main-layout-title">
        <span class="main-layout-logo">🛸</span>
        Rick and Morty
      </h1>

      <nav class="main-layout-nav">
        <Link to="characters" class="main-layout-nav-link">Characters</Link>
        <Link to="locations" class="main-layout-nav-link">Locations</Link>
        <Link to="episodes" class="main-layout-nav-link">Episodes</Link>
      </nav>
    </div>
  </header>

  <main class="main-layout-main">
    {@render children()}
  </main>
</div>
