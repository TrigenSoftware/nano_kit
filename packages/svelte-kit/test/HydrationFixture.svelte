<script lang="ts">
  import { setHydrationInjector } from '../src/hydration.js'
  import HydratedValue from './HydratedValue.svelte'

  setHydrationInjector({
    dehydrated: [['value', 'hello']]
  })
</script>

<HydratedValue />
