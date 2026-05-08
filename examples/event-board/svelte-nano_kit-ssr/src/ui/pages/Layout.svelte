<script module lang="ts">
  import {
    meta,
    title
  } from '@nano_kit/svelte-router'

  export function Head$() {
    return [
      title('Event Board'),
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
  import {
    enableLinkComponentAriaCurrent,
    enableLinkComponentPreload,
    Link,
    Outlet,
    syncHeadEffect
  } from '@nano_kit/svelte-router'

  syncHeadEffect()
  enableLinkComponentPreload(true)
  enableLinkComponentAriaCurrent()
</script>

<div class="app">
  <header class="header">
    <div class="container header__inner">
      <Link to="home" class="brand">Event Board</Link>

      <nav class="nav">
        <Link to="home">Events</Link>
        <Link to="newEvent">New event</Link>
      </nav>
    </div>
  </header>

  <main class="container main">
    <Outlet />
  </main>
</div>
