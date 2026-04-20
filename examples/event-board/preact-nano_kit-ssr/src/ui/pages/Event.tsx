import { inject } from '@nano_kit/store'
import {
  useInject,
  useSignal
} from '@nano_kit/preact'
import {
  Link,
  meta,
  title
} from '@nano_kit/preact-router'
import {
  EventDetails$,
  RsvpEvent$
} from '#src/stores/events'
import { Params$ } from '#src/stores/router'

const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  dateStyle: 'full',
  timeStyle: 'short'
})

export function Head$() {
  const { $event } = inject(EventDetails$)

  return [
    title(() => {
      const event = $event()

      return event
        ? `${event.title} | Event Board`
        : 'Event Board | Event'
    }),
    meta({
      name: 'description',
      content: () => $event()?.description ?? 'Event details'
    })
  ]
}

export function Stores$() {
  const { $event } = inject(EventDetails$)

  return [$event]
}

export default function EventPage() {
  const { $slug } = useInject(Params$)
  const {
    $event,
    $eventError,
    $eventLoading
  } = useInject(EventDetails$)
  const {
    rsvp,
    $rsvpError,
    $rsvpLoading
  } = useInject(RsvpEvent$)
  const slug = useSignal($slug)
  const event = useSignal($event)
  const error = useSignal($eventError)
  const loading = useSignal($eventLoading)
  const rsvpError = useSignal($rsvpError)
  const rsvpLoading = useSignal($rsvpLoading)
  const onRsvp = () => {
    rsvp(event!.id)
  }

  if (error) {
    return (
      <section className='page'>
        <div className='notice notice_error'>
          {error}
        </div>
      </section>
    )
  }

  if (loading && !event) {
    return (
      <section className='page'>
        <div className='notice'>
          Loading event...
        </div>
      </section>
    )
  }

  if (!event) {
    return (
      <section className='page'>
        <div className='page__header'>
          <p className='eyebrow'>Not found</p>
          <h1>Event not found</h1>
          <p>
            The event "{slug}" does not exist or was removed.
          </p>
        </div>
        <Link className='button button_secondary' to='home'>
          Back to events
        </Link>
      </section>
    )
  }

  return (
    <section className='page'>
      <div className='page__header'>
        <p className='eyebrow'>{event.category}</p>
        <h1>{event.title}</h1>
        <p>{event.description}</p>
      </div>

      <div className='details-panel'>
        <dl>
          <div>
            <dt>When</dt>
            <dd>{DATE_FORMATTER.format(new Date(event.startsAt))}</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>{event.location}</dd>
          </div>
          <div>
            <dt>Going</dt>
            <dd>{event.attendees}</dd>
          </div>
        </dl>

        {rsvpError && (
          <div className='notice notice_error'>
            {rsvpError}
          </div>
        )}

        <button
          className='button'
          type='button'
          disabled={rsvpLoading}
          onClick={onRsvp}
        >
          {rsvpLoading ? 'Saving...' : "I'm going"}
        </button>
      </div>

      <Link className='button button_secondary' to='home'>
        Back to events
      </Link>
    </section>
  )
}
