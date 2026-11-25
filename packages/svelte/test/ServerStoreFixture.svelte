<script lang="ts">
  import type { ReadableSignal } from '@nano_kit/store'

  interface Props {
    value: ReadableSignal<string>
    fail?: boolean
  }

  const { value, fail = false }: Props = $props()

  function after() {
    if (fail) {
      throw new Error('The render fails after the store is read')
    }

    return ''
  }
</script>

<p>{$value}{after()}</p>
