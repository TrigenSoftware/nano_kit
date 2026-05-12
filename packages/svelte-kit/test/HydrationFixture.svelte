<script lang="ts">
  import { setHydrationContext } from '../src/hydration.js'
  import HydratedValue from './HydratedValue.svelte'

  setHydrationContext({
    dehydrated: [['value', 'hello']]
  })
</script>

<HydratedValue />
