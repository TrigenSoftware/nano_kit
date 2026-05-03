<script lang="ts">
  import { Link } from './Link.js'

  interface Props {
    current: number
    total: number
    label: string
  }

  const {
    current,
    total,
    label
  }: Props = $props()
  const pages = $derived.by(() => {
    const range: Array<number | string> = []
    const start = Math.max(1, current - 2)
    const end = Math.min(total, current + 2)

    if (start > 1) {
      range.push(1)
    }

    if (start > 2) {
      range.push('...')
    }

    for (let page = start; page <= end; page++) {
      range.push(page)
    }

    if (end < total - 1) {
      range.push('...')
    }

    if (end < total) {
      range.push(total)
    }

    return range
  })

  function pageHref(page: number) {
    return `?page=${page}`
  }
</script>

{#if total > 1}
  <nav aria-label={label} class="pagination">
    <ul class="list">
      {#if current > 1}
        <li>
          <Link href={pageHref(current - 1)} class="link prev-next" aria-label="Previous page">
            <span aria-hidden="true">‹</span>
            <span class="sr-only">Previous</span>
          </Link>
        </li>
      {/if}

      {#each pages as page, index (`${page}-${index}`)}
        <li>
          {#if typeof page === 'number'}
            <Link
              href={pageHref(page)}
              class={`pagination-link${page === current ? ' current' : ''}`}
              aria-current={page === current ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </Link>
          {:else}
            <span aria-hidden="true">{page}</span>
          {/if}
        </li>
      {/each}

      {#if current < total}
        <li>
          <Link href={pageHref(current + 1)} class="link prev-next" aria-label="Next page">
            <span aria-hidden="true">›</span>
            <span class="sr-only">Next</span>
          </Link>
        </li>
      {/if}
    </ul>
  </nav>
{/if}

<style>
  .pagination {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
  }

  .list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: .25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  :global(.pagination-link),
  :global(.pagination .link),
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    height: 2.5rem;
    border: none;
    border-radius: .25rem;
    background-color: transparent;
    color: #616161;
    text-decoration: none;
    font-size: .875rem;
    font-weight: 500;
    transition: background-color .2s ease;
  }

  :global(.pagination-link:hover),
  :global(.pagination .link:hover) {
    background-color: #f5f5f5;
  }

  :global(.pagination-link:focus),
  :global(.pagination .link:focus) {
    outline: 2px solid #1976d2;
    outline-offset: 2px;
  }

  :global(.pagination-link.current) {
    background-color: #1976d2;
    color: white;
  }

  :global(.pagination-link.current:hover) {
    background-color: #1e88e5;
    color: white;
  }

  :global(.pagination .link) {
    padding: 0 .75rem;
  }

  .sr-only {
    position: absolute;
    overflow: hidden;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    clip: rect(0, 0, 0, 0);
    border: 0;
    white-space: nowrap;
  }

  @media (prefers-color-scheme: dark) {
    :global(.pagination-link),
    :global(.pagination .link) {
      color: #e0e0e0;
    }

    :global(.pagination-link:hover),
    :global(.pagination .link:hover) {
      background-color: #2c2c2c;
    }

    :global(.pagination-link.current) {
      background-color: #1976d2;
      color: white;
    }

    :global(.pagination-link.current:hover) {
      background-color: #1565c0;
      color: white;
    }
  }

  @media (max-width: 640px) {
    :global(.pagination-link),
    :global(.pagination .link),
    span {
      min-width: 2rem;
      height: 2rem;
      padding: .25rem;
      font-size: .75rem;
    }

    .pagination {
      margin: 1rem 0;
    }

    .list {
      gap: .125rem;
    }
  }
</style>
