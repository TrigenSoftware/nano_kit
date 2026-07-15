<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import {
    meta,
    title
  } from '@nano_kit/svelte-router'
  import {
    datetime,
    format,
    number,
    params,
    text,
    capitalize
  } from '@nano_kit/intl'
  import { EventDetails$ } from '#src/stores/events'
  import { Intl$ } from '#src/stores/intl'

  function Messages$() {
    const { messages } = inject(Intl$)

    return messages('event', {
      eventPageTitle: params({
        title: text()
      }),
      notFoundDescription: params({
        slug: text()
      }),
      attendees: format(number()),
      eventDate: format(capitalize(datetime({
        dateStyle: 'full',
        timeStyle: 'short'
      })))
    })
  }

  export function Stores$() {
    const [t] = inject(Messages$)
    const { $event: event } = inject(EventDetails$)

    return [t, event]
  }

  export function Head$() {
    const { $event: event } = inject(EventDetails$)
    const [t] = inject(Messages$)

    return [
      title(() => {
        const messages = t()
        const item = event()

        return item
          ? messages.eventPageTitle({
            title: item.title
          })
          : messages.pageTitle
      }),
      meta({
        name: 'description',
        content: () => event()?.description ?? t.$pageDescription()
      })
    ]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import { Link } from '@nano_kit/svelte-router'
  import { RsvpEvent$ } from '#src/stores/events'
  import { Params$ } from '#src/stores/router'

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
  const [t] = getInject(Messages$)

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
      {$t.loading}
    </div>
  </section>
{:else if !$event}
  <section class="page">
    <div class="page__header">
      <p class="eyebrow">{$t.notFoundEyebrow}</p>
      <h1>{$t.notFoundTitle}</h1>
      <p>
        {$t.notFoundDescription({
          slug: $slug
        })}
      </p>
    </div>
    <Link class="button button_secondary" to="home">
      {$t.backToEvents}
    </Link>
  </section>
{:else}
  <section class="page">
    <div class="page__header">
      <p class="eyebrow">{$t.categories?.[$event.category]}</p>
      <h1>{$event.title}</h1>
      <p>{$event.description}</p>
    </div>

    <div class="details-panel">
      <dl>
        <div>
          <dt>{$t.when}</dt>
          <dd>{$t.eventDate($event.startsAt)}</dd>
        </div>
        <div>
          <dt>{$t.where}</dt>
          <dd>{$event.location}</dd>
        </div>
        {#if $event.author}
          <div>
            <dt>{$t.hostedBy}</dt>
            <dd>{$event.author}</dd>
          </div>
        {/if}
        <div>
          <dt>{$t.going}</dt>
          <dd>{$t.attendees($event.attendees)}</dd>
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
        {$rsvpLoading ? $t.saving : $event.going ? $t.rsvpCancel : $t.rsvp}
      </button>
    </div>

    <Link class="button button_secondary" to="home">
      {$t.backToEvents}
    </Link>
  </section>
{/if}
