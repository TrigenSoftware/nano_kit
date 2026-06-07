<script lang="ts">
  import { Outlet } from '../../src/index.js'
  import { nextAuthLayoutRender } from './renders.js'

  const render = nextAuthLayoutRender()
</script>

<div class="auth-layout">
  <header>Auth Header {render}</header>
  <main>
    <Outlet />
  </main>
</div>
