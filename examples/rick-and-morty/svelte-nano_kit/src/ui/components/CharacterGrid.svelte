<script lang="ts">
  import type { Character } from '#src/services/api'
  import CharacterCard from './CharacterCard.svelte'

  interface Props {
    characters: Character[]
  }

  const { characters }: Props = $props()
</script>

<div class="grid">
  {#each characters as character (character.id)}
    <CharacterCard {character} />
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }
</style>
