import {
  type TargetedEvent,
  type TargetedMouseEvent
} from 'preact'
import {
  useInject,
  useSignal
} from '@nano_kit/preact'
import {
  Link,
  meta,
  title,
  useNavigation
} from '@nano_kit/preact-router'
import { inject } from '@nano_kit/store'
import { eventCategories } from '#src/services/events'
import { EventsList$ } from '#src/stores/events'
import { Params$ } from '#src/stores/router'

const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

export function Head$() {
  return [
    title('Event Board | Upcoming events'),
    meta({
      name: 'description',
      content: 'Find meetups, workshops, webinars, and conferences.'
    })
  ]
}

export function Stores$() {
  const { $events } = inject(EventsList$)

  return [$events]
}

function eventDate(startsAt: number) {
  return DATE_FORMATTER.format(new Date(startsAt))
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
  const q = useSignal($q)
  const category = useSignal($category)
  const data = useSignal($events)
  const error = useSignal($eventsError)
  const loading = useSignal($eventsLoading)
  const onSearch = (event: TargetedEvent<HTMLInputElement>) => {
    const searchParams = $searchParams()

    searchParams.set('q', event.currentTarget.value)

    navigation.replace({
      search: searchParams.toString()
    })
  }
  const onCategory = (event: TargetedEvent<HTMLSelectElement>) => {
    const searchParams = $searchParams()

    searchParams.set('category', event.currentTarget.value)

    navigation.replace({
      search: searchParams.toString()
    })
  }
  const onFilterSubmit = (event: TargetedEvent<HTMLFormElement>) => {
    event.preventDefault()
  }
  const onLoadMore = (event: TargetedMouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur()
    fetchNext()
  }
  const events = data?.pages.flatMap(page => page.events) ?? []

  return (
    <section className='page'>
      <div className='page__header'>
        <p className='eyebrow'>Upcoming events</p>
        <h1>Find your next frontend event</h1>
        <p>
          Meetups, workshops, webinars, and conferences collected in one small demo app.
        </p>
      </div>

      <form className='toolbar' role='search' onSubmit={onFilterSubmit}>
        <label className='field' htmlFor='events-search'>
          <span>Search</span>
          <input
            id='events-search'
            name='q'
            value={q}
            onChange={onSearch}
            type='search'
            placeholder='Search events'
          />
        </label>

        <label className='field' htmlFor='events-category'>
          <span>Category</span>
          <select
            id='events-category'
            name='category'
            value={category ?? ''}
            onChange={onCategory}
          >
            <option value=''>All categories</option>
            {eventCategories.map(item => (
              <option key={item} value={item}>
                {item}
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
          No events found. Try another search or category.
        </div>
      )}

      <div
        className={loading ? 'events-grid events-grid_loading' : 'events-grid'}
        aria-busy={loading}
      >
        {events.map(event => (
          <article key={event.id} className='event-card'>
            <div className='event-card__meta'>
              <span>{event.category}</span>
              <span>{eventDate(event.startsAt)}</span>
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
              <span>{event.attendees} going</span>
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
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}

      {loading && (
        <div className='notice notice_loading' role='status' aria-live='polite'>
          Loading...
        </div>
      )}
    </section>
  )
}
