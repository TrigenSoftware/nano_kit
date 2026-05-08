<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { Navigation$ } from '@nano_kit/svelte-router'

  export function Stores$() {
    const navigation = inject(Navigation$)

    navigation.replace('characters', true)

    return []
  }
</script>
