<script lang="ts">
  import type { Accessor } from '@nano_kit/store'
  import type { PageRef } from '../src/index.js'
  import { getPageTitle } from '../src/core.js'

  interface Props {
    page: Accessor<PageRef<unknown> | null>
  }

  const props: Props = $props()
  // svelte-ignore state_referenced_locally
  const title = getPageTitle(props.page)
</script>

<div data-testid="title">{$title}</div>
