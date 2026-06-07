<script lang="ts">
  import { toSignal } from '@nano_kit/store'
  import { getOutlet } from './outlet.js'

  const outlet = toSignal(getOutlet())
  const Outlet = $derived($outlet)
</script>

{#if Outlet}
  <Outlet />
{/if}
