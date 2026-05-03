<script lang="ts">
  import type { Character } from '#src/services/api'
  import { Link } from './Link.js'

  interface Props {
    character: Character
  }

  const { character }: Props = $props()
</script>

<article class="card">
  <Link
    to="character"
    params={{ id: character.id }}
    class="character-card-link"
  >
    <img src={character.image} alt={character.name} loading="lazy" />

    <div class="content">
      <h2 class="name">{character.name}</h2>

      <dl class="info">
        <div class="row">
          <dt>Status</dt>
          <dd class={`status ${character.status.toLowerCase()}`}>{character.status}</dd>
        </div>
        <div class="row">
          <dt>Species</dt>
          <dd>{character.species}</dd>
        </div>
        <div class="row">
          <dt>Origin</dt>
          <dd>{character.origin.name}</dd>
        </div>
        <div class="row">
          <dt>Episodes</dt>
          <dd>{character.episode.length}</dd>
        </div>
      </dl>
    </div>
  </Link>
</article>

<style>
  .card {
    overflow: hidden;
    border-radius: .5rem;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .12), 0 1px 2px rgba(0, 0, 0, .24);
    cursor: pointer;
    transition: box-shadow .2s ease;
  }

  .card:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, .16), 0 3px 6px rgba(0, 0, 0, .23);
  }

  :global(.character-card-link) {
    display: block;
    height: 100%;
    color: inherit;
    text-decoration: none;
  }

  img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    background: #f5f5f5;
  }

  .content {
    padding: 1rem;
  }

  .name {
    margin: 0 0 1rem;
    color: #212121;
    font-size: 1.125rem;
    font-weight: 500;
    line-height: 1.4;
  }

  .info {
    display: grid;
    gap: .75rem;
    margin: 0;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
  }

  dt {
    color: #757575;
    font-size: .875rem;
    font-weight: 400;
  }

  dd {
    margin: 0;
    color: #424242;
    text-align: right;
    font-size: .875rem;
    font-weight: 500;
  }

  .status {
    display: inline-flex;
    align-items: center;
    border-radius: .25rem;
    padding: .25rem .5rem;
    font-size: .75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .status.alive {
    background-color: #e8f5e8;
    color: #2e7d32;
  }

  .status.dead {
    background-color: #ffebee;
    color: #c62828;
  }

  .status.unknown {
    background-color: #f5f5f5;
    color: #757575;
  }

  @media (prefers-color-scheme: dark) {
    .card {
      background: #424242;
      box-shadow: 0 1px 3px rgba(0, 0, 0, .24), 0 1px 2px rgba(0, 0, 0, .32);
    }

    .card:hover {
      box-shadow: 0 3px 6px rgba(0, 0, 0, .32), 0 3px 6px rgba(0, 0, 0, .32);
    }

    img {
      background: #616161;
    }

    .name {
      color: #ffffff;
    }

    dt {
      color: #bdbdbd;
    }

    dd {
      color: #e0e0e0;
    }

    .status.alive {
      background-color: #1b5e20;
      color: #a5d6a7;
    }

    .status.dead {
      background-color: #b71c1c;
      color: #ef9a9a;
    }

    .status.unknown {
      background-color: #616161;
      color: #bdbdbd;
    }
  }

  @media (max-width: 768px) {
    .content {
      padding: .875rem;
    }

    .name {
      margin-bottom: .875rem;
      font-size: 1rem;
    }

    .row {
      align-items: flex-start;
      flex-direction: column;
      gap: .25rem;
    }

    dt,
    dd {
      font-size: .8125rem;
    }

    dd {
      text-align: left;
    }
  }
</style>
