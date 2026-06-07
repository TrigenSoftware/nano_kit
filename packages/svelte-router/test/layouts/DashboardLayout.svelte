<script lang="ts">
  import { Outlet } from '../../src/index.js'
  import { nextDashboardLayoutRender } from './renders.js'

  const render = nextDashboardLayoutRender()
</script>

<div class="dashboard">
  <span>Dashboard {render}</span>
  <Outlet />
</div>
