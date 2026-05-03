<script lang="ts">
  import { Outlet } from '@nano_kit/svelte-router'
  import { Link } from '../components/Link.js'
</script>

<div class="app">
  <header class="header">
    <div class="container">
      <h1 class="title">
        <span class="logo">🛸</span>
        Rick and Morty
      </h1>

      <nav class="nav">
        <Link to="characters" class="nav-link">Characters</Link>
        <Link to="locations" class="nav-link">Locations</Link>
        <Link to="episodes" class="nav-link">Episodes</Link>
      </nav>
    </div>
  </header>

  <main class="main">
    <Outlet />
  </main>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid #e0e0e0;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .12);
  }

  .container {
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    height: 4rem;
    padding: 0 1rem;
  }

  .title {
    display: flex;
    align-items: center;
    justify-self: start;
    gap: .5rem;
    margin: 0;
    color: #212121;
    font-size: 1.5rem;
    font-weight: 500;
  }

  .logo {
    font-size: 1.75rem;
  }

  .nav {
    display: flex;
    justify-self: center;
    gap: .5rem;
  }

  :global(.nav-link) {
    border-radius: .25rem;
    padding: .5rem 1rem;
    color: #757575;
    text-decoration: none;
    font-size: .875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: .05em;
    transition: all .2s ease;
  }

  :global(.nav-link:hover) {
    background-color: #f5f5f5;
    color: #424242;
  }

  :global(.nav-link[aria-current="page"]) {
    background-color: #1976d2;
    color: white;
  }

  :global(.nav-link[aria-current="page"]:hover) {
    background-color: #1565c0;
  }

  .main {
    flex: 1;
  }

  @media (prefers-color-scheme: dark) {
    .header {
      border-bottom-color: #616161;
      background: #424242;
    }

    .title {
      color: #ffffff;
    }

    :global(.nav-link) {
      color: #bdbdbd;
    }

    :global(.nav-link:hover) {
      background-color: #616161;
      color: #ffffff;
    }

    :global(.nav-link[aria-current="page"]) {
      background-color: #1976d2;
      color: white;
    }

    :global(.nav-link[aria-current="page"]:hover) {
      background-color: #1565c0;
    }
  }

  @media (max-width: 768px) {
    .container {
      display: flex;
      flex-direction: column;
      height: auto;
      gap: 1rem;
      padding: 1rem;
    }

    .title {
      justify-self: auto;
      font-size: 1.25rem;
    }

    .nav {
      width: 100%;
      justify-content: center;
      justify-self: auto;
    }

    :global(.nav-link) {
      flex: 1;
      padding: .75rem .5rem;
      text-align: center;
    }
  }
</style>
