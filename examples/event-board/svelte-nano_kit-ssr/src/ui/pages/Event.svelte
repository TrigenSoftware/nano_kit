<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import {
    meta,
    title
  } from '@nano_kit/svelte-router'
  import { EventDetails$ } from '#src/stores/events'

  export function Head$() {
    const { $event: event } = inject(EventDetails$)

    return [
      title(() => {
        const item = event()

        return item
          ? `${item.title} | Event Board`
          : 'Event | Event Board'
      }),
      meta({
        name: 'description',
        content: () => event()?.description ?? 'Event details'
      })
    ]
  }

  export function Stores$() {
    const { $event: event } = inject(EventDetails$)

    return [event]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import { Link } from '@nano_kit/svelte-router'
  import { RsvpEvent$ } from '#src/stores/events'
  import { Params$ } from '#src/stores/router'

  const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
    dateStyle: 'full',
    timeStyle: 'short'
  })
  const { $slug: slug } = getInject(Params$)
  const {
    $event: event,
    $eventError: error,
    $eventLoading: loading
  } = getInject(EventDetails$)
  const {
    rsvp,
    $rsvpError: rsvpError,
    $rsvpLoading: rsvpLoading
  } = getInject(RsvpEvent$)

  function onRsvp() {
    if ($event) {
      rsvp($event.id)
    }
  }
</script>

{#if $error}
  <section class="page">
    <div class="notice notice_error">
      {$error}
    </div>
  </section>
{:else if $loading && !$event}
  <section class="page">
    <div class="notice">
      Loading event...
    </div>
  </section>
{:else if !$event}
  <section class="page">
    <div class="page__header">
      <p class="eyebrow">Not found</p>
      <h1>Event not found</h1>
      <p>
        The event "{$slug}" does not exist or was removed.
      </p>
    </div>
    <Link class="button button_secondary" to="home">
      Back to events
    </Link>
  </section>
{:else}
  <section class="page">
    <div class="page__header">
      <p class="eyebrow">{$event.category}</p>
      <h1>{$event.title}</h1>
      <p>{$event.description}</p>
    </div>

    <div class="details-panel">
      <dl>
        <div>
          <dt>When</dt>
          <dd>{DATE_FORMATTER.format(new Date($event.startsAt))}</dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>{$event.location}</dd>
        </div>
        <div>
          <dt>Going</dt>
          <dd>{$event.attendees}</dd>
        </div>
      </dl>

      {#if $rsvpError}
        <div class="notice notice_error">
          {$rsvpError}
        </div>
      {/if}

      <button
        class="button"
        type="button"
        disabled={$rsvpLoading}
        onclick={onRsvp}
      >
        {$rsvpLoading ? 'Saving...' : "I'm going"}
      </button>
    </div>

    <Link class="button button_secondary" to="home">
      Back to events
    </Link>
  </section>
{/if}
