<script lang="ts">
  import type { InjectionProvider } from '@nano_kit/store'
  import { setInjectionContext } from '@nano_kit/svelte'
  import { getTitle } from '../src/hooks.js'

  interface Props {
    context: InjectionProvider[]
  }

  const props: Props = $props()

  // svelte-ignore state_referenced_locally
  setInjectionContext(props.context)

  const title = getTitle()
</script>

<div data-testid="title">{$title}</div>
