<script lang="ts">
  import type { InjectionProvider } from '@nano_kit/store'
  import { setInjectionContext } from '@nano_kit/svelte'
  import { Link } from '../src/link.js'
  import { enableLinkComponentPreload } from '../src/preloadable.js'

  interface Props {
    context: InjectionProvider[]
    preloadByDefault?: boolean
  }

  const props: Props = $props()

  // svelte-ignore state_referenced_locally
  setInjectionContext(props.context)
  // svelte-ignore state_referenced_locally
  enableLinkComponentPreload(props.preloadByDefault)
</script>

<Link to="about">About</Link>
