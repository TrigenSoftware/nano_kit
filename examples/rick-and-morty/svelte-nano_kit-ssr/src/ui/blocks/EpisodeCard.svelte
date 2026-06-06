<script lang="ts">
  import { Link } from '@nano_kit/svelte-router'
  import type { Episode } from '#src/services/api'

  interface Props {
    episode: Episode
  }

  const { episode }: Props = $props()
</script>

<article class="episode-card-card">
  <Link to="episode" params={{ id: episode.id }} class="episode-card-link">
    <div class="episode-card-content">
      <h2 class="episode-card-name">{episode.name}</h2>
      <dl class="episode-card-info">
        <div class="episode-card-row">
          <dt class="episode-card-label">Episode</dt>
          <dd class="episode-card-value">{episode.episode}</dd>
        </div>
        <div class="episode-card-row">
          <dt class="episode-card-label">Air date</dt>
          <dd class="episode-card-value">{episode.air_date}</dd>
        </div>
        <div class="episode-card-row">
          <dt class="episode-card-label">Characters</dt>
          <dd class="episode-card-value">{episode.characters.length}</dd>
        </div>
      </dl>
    </div>
  </Link>
</article>

