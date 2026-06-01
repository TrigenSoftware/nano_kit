<script lang="ts">
  import { setHydrationInjector } from '../src/hydration.js'
  import HydratedValue from './HydratedValue.svelte'

  setHydrationInjector({
    dehydrated: [['value', 'first']]
  })
  setHydrationInjector({
    dehydrated: [['value', 'second']]
  })
</script>

<HydratedValue />
