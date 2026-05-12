<script module lang="ts">
  import {
    hydratable,
    signal
  } from '@nano_kit/store'

  export function Value$() {
    return hydratable('value', signal<string | null>(null))
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'

  const value = getInject(Value$)
</script>

<div>{$value ?? 'empty'}</div>
