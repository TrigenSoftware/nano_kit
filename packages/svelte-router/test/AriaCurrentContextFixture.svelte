<script lang="ts">
  import type { InjectionProvider } from '@nano_kit/store'
  import { setInjector } from '@nano_kit/svelte'
  import { Link } from '../src/link.js'
  import { enableLinkComponentAriaCurrent } from '../src/aria-current.js'

  interface Props {
    injector: InjectionProvider[]
  }

  const props: Props = $props()

  // svelte-ignore state_referenced_locally
  setInjector(props.injector)
  enableLinkComponentAriaCurrent()
</script>

<Link href="/">Home</Link>
<Link href="/about">About</Link>
