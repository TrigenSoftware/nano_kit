<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import {
    meta,
    title
  } from '@nano_kit/svelte-router'
  import {
    datetime,
    format,
    plural,
    capitalize
  } from '@nano_kit/intl'
  import { EventsList$ } from '#src/stores/events'
  import { Intl$ } from '#src/stores/intl'

  function Messages$() {
    const { messages } = inject(Intl$)

    return messages('home', {
      attendees: plural('count'),
      eventDate: format(capitalize(datetime({
        dateStyle: 'medium',
        timeStyle: 'short'
      })))
    })
  }

  export function Stores$() {
    const [t] = inject(Messages$)
    const { $events: events } = inject(EventsList$)

    return [t, events]
  }

  export function Head$() {
    const [t] = inject(Messages$)

    return [
      title(t.$pageTitle),
      meta({
        name: 'description',
        content: t.$pageDescription
      })
    ]
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
  const [t] = getInject(Messages$)
  const events = $derived($data?.pages.flatMap(page => page.events) ?? [])

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
    <p class="eyebrow">{$t.eyebrow}</p>
    <h1>{$t.title}</h1>
    <p>
      {$t.description}
    </p>
  </div>

  <form class="toolbar" role="search" onsubmit={onFilterSubmit}>
    <label class="field" for="events-search">
      <span>{$t.search}</span>
      <input
        id="events-search"
        name="q"
        value={$q}
        oninput={onSearch}
        type="search"
        placeholder={$t.searchPlaceholder}
      />
    </label>

    <label class="field" for="events-category">
      <span>{$t.category}</span>
      <select
        id="events-category"
        name="category"
        value={$category ?? ''}
        onchange={onCategory}
      >
        <option value="">{$t.allCategories}</option>
        {#each eventCategories as item}
          <option value={item}>{$t.categories?.[item]}</option>
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
      {$t.noEvents}
    </div>
  {/if}

  <div
    class={$loading ? 'events-grid events-grid_loading' : 'events-grid'}
    aria-busy={$loading}
  >
    {#each events as event (event.id)}
      <article class="event-card">
        <div class="event-card__meta">
          <span>{$t.categories?.[event.category]}</span>
          <span>{$t.eventDate(event.startsAt)}</span>
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
          <span>{$t.attendees(event.attendees)}</span>
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
      {$loading ? $t.loading : $t.loadMore}
    </button>
  {/if}

  {#if $loading}
    <div class="notice notice_loading" role="status" aria-live="polite">
      {$t.loading}
    </div>
  {/if}
</section>
