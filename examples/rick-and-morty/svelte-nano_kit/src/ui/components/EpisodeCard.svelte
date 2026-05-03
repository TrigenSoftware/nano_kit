<script lang="ts">
  import type { Episode } from '#src/services/api'
  import { Link } from './Link.js'

  interface Props {
    episode: Episode
  }

  const { episode }: Props = $props()
</script>

<article class="card">
  <Link to="episode" params={{ id: episode.id }} class="episode-card-link">
    <div class="content">
      <h2 class="name">{episode.name}</h2>
      <dl class="info">
        <div class="row">
          <dt>Episode</dt>
          <dd>{episode.episode}</dd>
        </div>
        <div class="row">
          <dt>Air date</dt>
          <dd>{episode.air_date}</dd>
        </div>
        <div class="row">
          <dt>Characters</dt>
          <dd>{episode.characters.length}</dd>
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

  :global(.episode-card-link) {
    display: block;
    color: inherit;
    text-decoration: none;
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
  }

  dd {
    margin: 0;
    color: #424242;
    text-align: right;
    font-size: .875rem;
    font-weight: 500;
  }

  @media (prefers-color-scheme: dark) {
    .card {
      background: #424242;
      box-shadow: 0 1px 3px rgba(0, 0, 0, .24), 0 1px 2px rgba(0, 0, 0, .32);
    }

    .card:hover {
      box-shadow: 0 3px 6px rgba(0, 0, 0, .32), 0 3px 6px rgba(0, 0, 0, .32);
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
