<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import {
    meta,
    title
  } from '@nano_kit/svelte-router'
  import { EventsList$ } from '#src/stores/events'

  export function Head$() {
    return [
      title('Upcoming events | Event Board'),
      meta({
        name: 'description',
        content: 'Find meetups, workshops, webinars, and conferences.'
      })
    ]
  }

  export function Stores$() {
    const { $events: events } = inject(EventsList$)

    return [events]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import {
    Navigation$,
    Link
  } from '@nano_kit/svelte-router'
  import { eventCategories } from '#src/services/events'
  import { Params$ } from '#src/stores/router'

  const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
  const navigation = getInject(Navigation$)
  const {
    $q: q,
    $category: category,
    $searchParams: searchParams
  } = getInject(Params$)
  const {
    fetchNext,
    $events: data,
    $eventsError: error,
    $eventsLoading: loading
  } = getInject(EventsList$)
  const events = $derived($data?.pages.flatMap(page => page.events) ?? [])

  function eventDate(startsAt: number) {
    return DATE_FORMATTER.format(new Date(startsAt))
  }

  function onSearch(event: Event) {
    const params = searchParams()

    params.set('q', (event.currentTarget as HTMLInputElement).value)
    navigation.replace({
      search: params.toString()
    })
  }

  function onCategory(event: Event) {
    const params = searchParams()

    params.set('category', (event.currentTarget as HTMLSelectElement).value)
    navigation.replace({
      search: params.toString()
    })
  }

  function onFilterSubmit(event: SubmitEvent) {
    event.preventDefault()
  }

  function onLoadMore(event: MouseEvent) {
    (event.currentTarget as HTMLButtonElement).blur()
    fetchNext()
  }
</script>

<section class="page">
  <div class="page__header">
    <p class="eyebrow">Upcoming events</p>
    <h1>Find your next frontend event</h1>
    <p>
      Meetups, workshops, webinars, and conferences collected in one small demo app.
    </p>
  </div>

  <form class="toolbar" role="search" onsubmit={onFilterSubmit}>
    <label class="field" for="events-search">
      <span>Search</span>
      <input
        id="events-search"
        name="q"
        value={$q}
        oninput={onSearch}
        type="search"
        placeholder="Search events"
      />
    </label>

    <label class="field" for="events-category">
      <span>Category</span>
      <select
        id="events-category"
        name="category"
        value={$category ?? ''}
        onchange={onCategory}
      >
        <option value="">All categories</option>
        {#each eventCategories as item}
          <option value={item}>{item}</option>
        {/each}
      </select>
    </label>
  </form>

  {#if $error}
    <div class="notice notice_error">
      {$error}
    </div>
  {/if}

  {#if !$error && events.length === 0 && !$loading}
    <div class="notice">
      No events found. Try another search or category.
    </div>
  {/if}

  <div
    class={$loading ? 'events-grid events-grid_loading' : 'events-grid'}
    aria-busy={$loading}
  >
    {#each events as event (event.id)}
      <article class="event-card">
        <div class="event-card__meta">
          <span>{event.category}</span>
          <span>{eventDate(event.startsAt)}</span>
        </div>
        <h2>
          <Link
            to="event"
            params={{
              slug: event.slug
            }}
          >
            {event.title}
          </Link>
        </h2>
        <p>{event.description}</p>
        <div class="event-card__footer">
          <span>{event.location}</span>
          <span>{event.attendees} going</span>
        </div>
      </article>
    {/each}
  </div>

  {#if $data?.more}
    <button
      class="button button_secondary"
      type="button"
      disabled={$loading}
      onclick={onLoadMore}
    >
      {$loading ? 'Loading...' : 'Load more'}
    </button>
  {/if}

  {#if $loading}
    <div class="notice notice_loading" role="status" aria-live="polite">
      Loading...
    </div>
  {/if}
</section>
