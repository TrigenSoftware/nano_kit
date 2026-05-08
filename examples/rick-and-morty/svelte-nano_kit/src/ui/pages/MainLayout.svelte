<script module lang="ts">
  import {
    meta,
    title
  } from '@nano_kit/svelte-router'

  export function Head$() {
    return [
      title('Rick and Morty Wiki'),
      meta({
        charSet: 'utf-8'
      }),
      meta({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      })
    ]
  }
</script>

<script lang="ts">
  import { Outlet } from '@nano_kit/svelte-router'
  import { Link } from '../components/Link.js'
</script>

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
    <Outlet />
  </main>
</div>
