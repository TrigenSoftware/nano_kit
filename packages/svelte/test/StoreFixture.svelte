<script lang="ts">
  import type { WritableSignal } from '@nano_kit/store'

  interface Props {
    count: WritableSignal<number>
  }

  const { count }: Props = $props()
</script>

<button onclick={() => count(c => c + 1)}>
  {$count}
</button>
