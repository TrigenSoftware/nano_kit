<script lang="ts">
  import type { InjectionProvider } from '@nano_kit/store'
  import { setInjectionContext } from '@nano_kit/svelte'
  import { Link } from '../src/link.js'
  import { enableLinkComponentAriaCurrent } from '../src/aria-current.js'

  interface Props {
    context: InjectionProvider[]
  }

  const props: Props = $props()

  // svelte-ignore state_referenced_locally
  setInjectionContext(props.context)
  enableLinkComponentAriaCurrent()
</script>

<Link href="/">Home</Link>
<Link href="/about">About</Link>
