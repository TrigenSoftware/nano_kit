<script lang="ts">
  import '@nano_kit/svelte'
  import { getKitNavigation } from '../src/navigation.js'
  import {
    navigationRoutes,
    setNavigationState
  } from './navigation-state.js'

  const [location, navigation] = getKitNavigation(navigationRoutes)

  setNavigationState(location, navigation)
</script>

<div data-testid="pathname">{$location.pathname}</div>
<div data-testid="route">{$location.route}</div>
<div data-testid="params">{JSON.stringify($location.params)}</div>
