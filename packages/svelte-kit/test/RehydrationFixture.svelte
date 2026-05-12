<script lang="ts">
  import { setHydrationContext } from '../src/hydration.js'
  import HydratedValue from './HydratedValue.svelte'

  setHydrationContext({
    dehydrated: [['value', 'first']]
  })
  setHydrationContext({
    dehydrated: [['value', 'second']]
  })
</script>

<HydratedValue />
