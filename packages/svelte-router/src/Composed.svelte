<script lang="ts">
  import type { Accessor } from '@nano_kit/store'
  import type { PageComponent } from './types.js'
  import { setOutlet } from './outlet.js'

  interface Props {
    outlet: Accessor<PageComponent | null>
    layout: PageComponent
  }

  const props: Props = $props()

  // svelte-ignore state_referenced_locally
  setOutlet(props.outlet)
</script>

<props.layout />
