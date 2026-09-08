<script lang="ts">
  import type { InjectionProvider } from '@nano_kit/store'
  import { setInjectionContext } from '@nano_kit/svelte'
  import App from '../src/App.svelte'

  interface Props {
    context: InjectionProvider[]
  }

  const props: Props = $props()

  // svelte-ignore state_referenced_locally
  setInjectionContext(props.context)
</script>

<App />
