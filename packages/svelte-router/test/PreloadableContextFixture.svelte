<script lang="ts">
  import type { InjectionProvider } from '@nano_kit/store'
  import { setInjector } from '@nano_kit/svelte'
  import { Link } from '../src/link.js'
  import { enableLinkComponentPreload } from '../src/preloadable.js'

  interface Props {
    injector: InjectionProvider[]
    preloadByDefault?: boolean
  }

  const props: Props = $props()

  // svelte-ignore state_referenced_locally
  setInjector(props.injector)
  // svelte-ignore state_referenced_locally
  enableLinkComponentPreload(props.preloadByDefault)
</script>

<Link to="about">About</Link>
