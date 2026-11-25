<script lang="ts">
  import type { InjectionProvider } from '@nano_kit/store'
  import { setHydrationContext } from '../src/dehydration.js'
  import RequestValues from './RequestValues.svelte'

  const props: { providers?: InjectionProvider[] } = $props()

  // svelte-ignore state_referenced_locally
  setHydrationContext({
    context: props.providers
  })
</script>

<RequestValues />
