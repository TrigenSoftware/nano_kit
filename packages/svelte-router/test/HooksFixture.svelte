<script lang="ts">
  import type { InjectionProvider } from '@nano_kit/store'
  import { setInjectionContext } from '@nano_kit/svelte'
  import {
    getCanGoBack,
    getLocation,
    getNavigation,
    getPaths
  } from '../src/hooks.js'

  interface Props {
    context: InjectionProvider[]
  }

  const props: Props = $props()

  // svelte-ignore state_referenced_locally
  setInjectionContext(props.context)

  const location = getLocation()
  const navigation = getNavigation()
  const paths = getPaths()
  const canGoBack = getCanGoBack()
</script>

<div data-testid="pathname">{$location.pathname}</div>
<div data-testid="route">{$location.route}</div>
<div data-testid="about">{paths.about}</div>
<div data-testid="can-go-back">{String($canGoBack)}</div>
<button onclick={() => navigation.push(paths.about)}>Go</button>
