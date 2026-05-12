<script lang="ts">
  import { Link } from '@nano_kit/svelte-kit'

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
  <nav aria-label={label} class="pagination-pagination">
    <ul class="pagination-list">
      {#if current > 1}
        <li>
          <Link href={pageHref(current - 1)} class="pagination-link pagination-prev-next" aria-label="Previous page">
            <span aria-hidden="true">‹</span>
            <span class="pagination-sr-only">Previous</span>
          </Link>
        </li>
      {/if}

      {#each pages as page, index (`${page}-${index}`)}
        <li>
          {#if typeof page === 'number'}
            <Link
              href={pageHref(page)}
              class={`pagination-link pagination-page${page === current ? ' pagination-current' : ''}`}
              aria-current={page === current ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </Link>
          {:else}
            <span class="pagination-ellipsis" aria-hidden="true">{page}</span>
          {/if}
        </li>
      {/each}

      {#if current < total}
        <li>
          <Link href={pageHref(current + 1)} class="pagination-link pagination-prev-next" aria-label="Next page">
            <span aria-hidden="true">›</span>
            <span class="pagination-sr-only">Next</span>
          </Link>
        </li>
      {/if}
    </ul>
  </nav>
{/if}
