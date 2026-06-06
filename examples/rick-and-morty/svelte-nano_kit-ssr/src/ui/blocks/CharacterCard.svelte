<script lang="ts">
  import { Link } from '@nano_kit/svelte-router'
  import type { Character } from '#src/services/api'

  interface Props {
    character: Character
  }

  const { character }: Props = $props()
</script>

<article class="character-card-card">
  <Link
    to="character"
    params={{ id: character.id }}
    class="character-card-link"
  >
    <div class="character-card-image-wrapper">
      <img class="character-card-image" src={character.image} alt={character.name} loading="lazy" />
    </div>

    <div class="character-card-content">
      <h2 class="character-card-name">{character.name}</h2>

      <dl class="character-card-info">
        <div class="character-card-row">
          <dt class="character-card-label">Status</dt>
          <dd class={`character-card-status character-card-status--${character.status.toLowerCase()}`}>{character.status}</dd>
        </div>
        <div class="character-card-row">
          <dt class="character-card-label">Species</dt>
          <dd class="character-card-value">{character.species}</dd>
        </div>
        <div class="character-card-row">
          <dt class="character-card-label">Origin</dt>
          <dd class="character-card-value">{character.origin.name}</dd>
        </div>
        <div class="character-card-row">
          <dt class="character-card-label">Episodes</dt>
          <dd class="character-card-value">{character.episode.length}</dd>
        </div>
      </dl>
    </div>
  </Link>
</article>

