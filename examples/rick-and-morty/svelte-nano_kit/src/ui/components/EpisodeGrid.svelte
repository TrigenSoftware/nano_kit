<script lang="ts">
  import type { Episode } from '#src/services/api'
  import EpisodeCard from './EpisodeCard.svelte'

  interface Props {
    episodes: Episode[]
  }

  const { episodes }: Props = $props()
</script>

<div class="grid">
  {#each episodes as episode (episode.id)}
    <EpisodeCard {episode} />
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
