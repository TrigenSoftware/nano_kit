<script lang="ts">
  import { setHydrationContext } from '@nano_kit/svelte-kit'
  import CharacterPage from '#src/ui/pages/Character.svelte'

  let { data } = $props()

  setHydrationContext({
    dehydrated: () => data.dehydrated
  })
</script>

<CharacterPage />
