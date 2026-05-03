<script lang="ts">
  import { Outlet } from '../../src/core.js'
  import { nextAuthShortLayoutRender } from './renders.js'

  const render = nextAuthShortLayoutRender()
</script>

<div class="auth">
  <span>Auth {render}</span>
  <Outlet />
</div>
