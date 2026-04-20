import { type TargetedEvent } from 'preact'
import { useEffect } from 'preact/hooks'
import {
  useInject,
  useSignal
} from '@nano_kit/preact'
import { title } from '@nano_kit/preact-router'
import { eventCategories } from '#src/services/events'
import { NewEventForm$ } from '#src/stores/events'

export function Head$() {
  return [
    title('Event Board | New event')
  ]
}

export default function NewEventPage() {
  const form = useInject(NewEventForm$)
  const titleValue = useSignal(form.$title)
  const description = useSignal(form.$description)
  const startsAt = useSignal(form.$startsAt)
  const location = useSignal(form.$location)
  const category = useSignal(form.$category)
  const errors = useSignal(form.$errors)
  const valid = useSignal(form.$valid)
  const createError = useSignal(form.$createError)
  const loading = useSignal(form.$createLoading)
  const onSubmit = (event: TargetedEvent<HTMLFormElement>) => {
    event.preventDefault()
    form.submit()
  }
  const setCategory = (event: TargetedEvent<HTMLSelectElement>) => {
    form.$category(event.currentTarget.value as typeof eventCategories[number])
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === 'm'
        && (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault()
        form.fillMock()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [form])

  return (
    <section className='page'>
      <div className='page__header'>
        <p className='eyebrow'>New event</p>
        <h1>Create an event</h1>
        <p>
          Add an event to the in-memory API and open its public page.
        </p>
        <p className='shortcut-hint'>
          Press Ctrl+M or Cmd+M to fill the form with sample data.
        </p>
      </div>

      <form className='form' onSubmit={onSubmit}>
        <label className='field' htmlFor='event-title'>
          <span>Title</span>
          <input
            id='event-title'
            name='title'
            value={titleValue}
            onChange={event => form.$title(event.currentTarget.value)}
            type='text'
            placeholder='Frontend Meetup'
            required
          />
          {errors.title && <small>{errors.title}</small>}
        </label>

        <label className='field' htmlFor='event-description'>
          <span>Description</span>
          <textarea
            id='event-description'
            name='description'
            value={description}
            onChange={event => form.$description(event.currentTarget.value)}
            placeholder='Short talks, demos, and hallway conversations.'
            required
          />
          {errors.description && <small>{errors.description}</small>}
        </label>

        <div className='form__row'>
          <label className='field' htmlFor='event-starts-at'>
            <span>Date and time</span>
            <input
              id='event-starts-at'
              name='startsAt'
              value={startsAt}
              onChange={event => form.$startsAt(event.currentTarget.value)}
              type='datetime-local'
              required
            />
            {errors.startsAt && <small>{errors.startsAt}</small>}
          </label>

          <label className='field' htmlFor='event-category'>
            <span>Category</span>
            <select
              id='event-category'
              name='category'
              value={category}
              onChange={setCategory}
              required
            >
              {eventCategories.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className='field' htmlFor='event-location'>
          <span>Location</span>
          <input
            id='event-location'
            name='location'
            value={location}
            onChange={event => form.$location(event.currentTarget.value)}
            type='text'
            placeholder='Online'
            required
          />
          {errors.location && <small>{errors.location}</small>}
        </label>

        {createError && (
          <div className='notice notice_error'>
            {createError}
          </div>
        )}

        <button className='button' type='submit' disabled={!valid || loading}>
          {loading ? 'Creating...' : 'Create event'}
        </button>
      </form>
    </section>
  )
}
