<script lang="ts">
  import { Outlet } from '../../src/index.js'
  import { nextAuthShortLayoutRender } from './renders.js'

  const render = nextAuthShortLayoutRender()
</script>

<div class="auth">
  <span>Auth {render}</span>
  <Outlet />
</div>
