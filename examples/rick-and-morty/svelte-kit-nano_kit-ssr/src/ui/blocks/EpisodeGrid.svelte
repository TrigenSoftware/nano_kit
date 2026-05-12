<script lang="ts">
  import type { Episode } from '#src/services/api'
  import EpisodeCard from './EpisodeCard.svelte'

  interface Props {
    episodes: Episode[]
  }

  const { episodes }: Props = $props()
</script>

<div class="episodes-grid-grid">
  {#each episodes as episode (episode.id)}
    <EpisodeCard {episode} />
  {/each}
</div>

