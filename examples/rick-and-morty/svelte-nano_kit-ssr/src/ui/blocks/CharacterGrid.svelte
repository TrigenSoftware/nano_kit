<script lang="ts">
  import type { Character } from '#src/services/api'
  import CharacterCard from './CharacterCard.svelte'

  interface Props {
    characters: Character[]
  }

  const { characters }: Props = $props()
</script>

<div class="characters-grid-grid">
  {#each characters as character (character.id)}
    <CharacterCard {character} />
  {/each}
</div>

