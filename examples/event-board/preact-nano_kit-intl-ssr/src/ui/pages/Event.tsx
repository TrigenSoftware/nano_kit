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
  raw,
  datetime,
  format,
  number,
  params,
  text,
  capitalize
} from '@nano_kit/intl'
import {
  EventDetails$,
  RsvpEvent$
} from '#src/stores/events'
import { Intl$ } from '#src/stores/intl'
import { Params$ } from '#src/stores/router'

function Messages$() {
  const { messages } = inject(Intl$)

  return messages('event', {
    pageTitle: text(),
    pageDescription: text(),
    eventPageTitle: params({
      title: text()
    }),
    loading: text(),
    notFoundEyebrow: text(),
    notFoundTitle: text(),
    notFoundDescription: params({
      slug: text()
    }),
    backToEvents: text(),
    categories: raw<Record<string, string>>(),
    when: text(),
    where: text(),
    going: text(),
    saving: text(),
    rsvp: text(),
    attendees: format(number()),
    eventDate: format(capitalize(datetime({
      dateStyle: 'full',
      timeStyle: 'short'
    })))
  })
}

export function Stores$() {
  const [$t] = inject(Messages$)
  const { $event } = inject(EventDetails$)

  return [$t, $event]
}

export function Head$() {
  const { $event } = inject(EventDetails$)
  const [$t] = inject(Messages$)

  return [
    title(() => {
      const t = $t()
      const event = $event()

      return event
        ? t.eventPageTitle({
          title: event.title
        })
        : t.pageTitle
    }),
    meta({
      name: 'description',
      content: () => $event()?.description ?? $t.$pageDescription()
    })
  ]
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
  const [$t, $messagesPending] = useInject(Messages$)
  const slug = useSignal($slug)
  const event = useSignal($event)
  const error = useSignal($eventError)
  const loading = useSignal($eventLoading)
  const rsvpError = useSignal($rsvpError)
  const rsvpLoading = useSignal($rsvpLoading)
  const messagesPending = useSignal($messagesPending)
  const t = useSignal($t)
  const onRsvp = () => {
    rsvp(event!.id)
  }

  if (messagesPending || loading && !event) {
    return (
      <section className='page message-block' aria-busy={messagesPending}>
        <div className='notice'>
          {t.loading}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className='page message-block' aria-busy={messagesPending}>
        <div className='notice notice_error'>
          {error}
        </div>
      </section>
    )
  }

  if (!event) {
    return (
      <section className='page message-block' aria-busy={messagesPending}>
        <div className='page__header'>
          <p className='eyebrow'>{t.notFoundEyebrow}</p>
          <h1>{t.notFoundTitle}</h1>
          <p>
            {t.notFoundDescription({
              slug
            })}
          </p>
        </div>
        <Link className='button button_secondary' to='home'>
          {t.backToEvents}
        </Link>
      </section>
    )
  }

  return (
    <section className='page message-block' aria-busy={messagesPending}>
      <div className='page__header'>
        <p className='eyebrow'>
          {t.categories?.[event.category]}
        </p>
        <h1>{event.title}</h1>
        <p>{event.description}</p>
      </div>

      <div className='details-panel'>
        <dl>
          <div>
            <dt>{t.when}</dt>
            <dd>{t.eventDate(event.startsAt)}</dd>
          </div>
          <div>
            <dt>{t.where}</dt>
            <dd>{event.location}</dd>
          </div>
          <div>
            <dt>{t.going}</dt>
            <dd>{t.attendees(event.attendees)}</dd>
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
          {rsvpLoading ? t.saving : t.rsvp}
        </button>
      </div>

      <Link className='button button_secondary' to='home'>
        {t.backToEvents}
      </Link>
    </section>
  )
}
