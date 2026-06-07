import type {
  ChangeEvent,
  FormEvent,
  MouseEvent
} from 'react'
import {
  useInject,
  useSignal
} from '@nano_kit/react'
import {
  Link,
  meta,
  title,
  useNavigation
} from '@nano_kit/react-router'
import { inject } from '@nano_kit/store'
import {
  datetime,
  format,
  plural,
  capitalize
} from '@nano_kit/intl'
import { eventCategories } from '#src/services/events'
import { EventsList$ } from '#src/stores/events'
import { Intl$ } from '#src/stores/intl'
import { Params$ } from '#src/stores/router'

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
  const [$t] = inject(Messages$)
  const { $events } = inject(EventsList$)

  return [$t, $events]
}

export function Head$() {
  const [$t] = inject(Messages$)

  return [
    title($t.$pageTitle),
    meta({
      name: 'description',
      content: $t.$pageDescription
    })
  ]
}

export default function Home() {
  const navigation = useNavigation()
  const {
    $q,
    $category,
    $searchParams
  } = useInject(Params$)
  const {
    fetchNext,
    $events,
    $eventsError,
    $eventsLoading
  } = useInject(EventsList$)
  const [$t] = useInject(Messages$)
  const q = useSignal($q)
  const category = useSignal($category)
  const data = useSignal($events)
  const error = useSignal($eventsError)
  const loading = useSignal($eventsLoading)
  const t = useSignal($t)
  const onSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const searchParams = $searchParams()

    searchParams.set('q', event.currentTarget.value)

    navigation.replace({
      search: searchParams.toString()
    })
  }
  const onCategory = (event: ChangeEvent<HTMLSelectElement>) => {
    const searchParams = $searchParams()

    searchParams.set('category', event.currentTarget.value)

    navigation.replace({
      search: searchParams.toString()
    })
  }
  const onFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }
  const onLoadMore = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur()
    void fetchNext()
  }
  const events = data?.pages.flatMap(page => page.events) ?? []

  return (
    <section className='page'>
      <div className='page__header'>
        <p className='eyebrow'>{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>
          {t.description}
        </p>
      </div>

      <form className='toolbar' role='search' onSubmit={onFilterSubmit}>
        <label className='field' htmlFor='events-search'>
          <span>{t.search}</span>
          <input
            id='events-search'
            name='q'
            value={q}
            onChange={onSearch}
            type='search'
            placeholder={t.searchPlaceholder}
          />
        </label>

        <label className='field' htmlFor='events-category'>
          <span>{t.category}</span>
          <select
            id='events-category'
            name='category'
            value={category ?? ''}
            onChange={onCategory}
          >
            <option value=''>{t.allCategories}</option>
            {eventCategories.map(category => (
              <option key={category} value={category}>
                {t.categories?.[category]}
              </option>
            ))}
          </select>
        </label>
      </form>

      {error && (
        <div className='notice notice_error'>
          {error}
        </div>
      )}

      {!error && events.length === 0 && !loading && (
        <div className='notice'>
          {t.noEvents}
        </div>
      )}

      <div
        className={loading ? 'events-grid events-grid_loading' : 'events-grid'}
        aria-busy={loading}
      >
        {events.map(event => (
          <article key={event.id} className='event-card'>
            <div className='event-card__meta'>
              <span>
                {t.categories?.[event.category]}
              </span>
              <span>{t.eventDate(event.startsAt)}</span>
            </div>
            <h2>
              <Link
                to='event'
                params={{
                  slug: event.slug
                }}
              >
                {event.title}
              </Link>
            </h2>
            <p>{event.description}</p>
            <div className='event-card__footer'>
              <span>{event.location}</span>
              <span>
                {t.attendees(event.attendees)}
              </span>
            </div>
          </article>
        ))}
      </div>

      {data?.more && (
        <button
          className='button button_secondary'
          type='button'
          disabled={loading}
          onClick={onLoadMore}
        >
          {loading ? t.loading : t.loadMore}
        </button>
      )}

      {loading && (
        <div className='notice notice_loading' role='status' aria-live='polite'>
          {t.loading}
        </div>
      )}
    </section>
  )
}
